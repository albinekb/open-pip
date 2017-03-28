#!/usr/bin/env node
const spawn = require('child-process-promise').spawn
const path = require('path')
const fsp = require('fs-promise')
const ora = require('ora')
const pMinDelay = require('p-min-delay')
const APP_PATH = path.join(__dirname, 'pip.app')

const spinner = ora().start()

const parseUrl = async (string) => {
  if (string.startsWith('/')) {
    const url = path.resolve(string)
    if (await fsp.exists(url) {
      return `file:///${encodeURIComponent(url.replace(/^\//g, ''))}`
    } else {
     return `file:///${encodeURIComponent(string.replace(/^\//g, ''))}`
    }
  }

  if (string.startsWith('http')) {
    return string
  }

  return `file:///${encodeURIComponent(string)}`
}

const input = process.argv[2]

if (!input) throw new Error('No url supplied')

const kill = () => Promise.all([
  spawn('killall', ['pip']),
  spawn('killall', ['PIPAgent'])
]).then(() => true).catch(() => false)

async function cleanup () {
  const errorFile = path.join(APP_PATH, 'error.log')
  const exists = await fsp.exists(errorFile)
  if (exists) await fsp.remove(errorFile)
  return exists
}

async function didFail () {
  const errorFile = path.join(APP_PATH, 'error.log')
  const exists = await fsp.exists(errorFile)
  if (exists) await fsp.remove(errorFile)

  return exists
}

async function run () {
  const parsed = await parseUrl(input.replace(/^"/g, '').replace(/"$/g, '').replace(/^'/g, '').replace(/'$/g, ''))
  const killed = await kill()
  if (killed) {
    spinner.info(`Killed running pip.app`)
  }
  const cleaned = await cleanup()

  if (cleaned) {
    spinner.info('Cleaned up previous error')
  }

  spinner.info(`Attempting to open ${parsed} in pip.app 📺`)

  const runner = spawn('open', [APP_PATH, '--args', parsed])
    .catch((err) => {
      spinner.fail('App quit 🔴')
      throw err
    })

  return pMinDelay(runner, 1000)
  .then(didFail)
  .then(failed => {
    if (failed) return Promise.reject()
    return Promise.resolve()
  })
}

// process.on('SIGINT', function () {
//   cleanup()
//   fkill(['pip', 'PIPAgent']).catch(() => console.log('Did not kill pip.app 💀'))
// })

run()
  .then(() => {
    spinner.stopAndPersist({ symbol: '🌟', text: 'Running' })
  })
  .catch((err) => {
    spinner.fail('Something went wrong')
    if (err) console.log(err)
  })
