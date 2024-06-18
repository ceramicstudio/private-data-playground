import ora from 'ora'
import { spawn } from "child_process"
import { EventEmitter } from 'events'

const events = new EventEmitter()
const spinner = ora();

const ceramic = spawn("npm", ["run", "ceramic"]);
ceramic.stdout.on("data", (buffer) => {
  console.log('[Ceramic-One]', buffer.toString())
  if (buffer.toString().includes("connection established")) {
    events.emit("ceramic", true);
    spinner.succeed("ceramic-one node started");
  }
})

ceramic.stderr.on('data', (err) => {
  console.log(err.toString())
})

const next = async () => {
  const next = spawn('npm', ['run', 'nextDev'])
  spinner.info("[NextJS] starting nextjs app");
  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const start = async () => {
  try {
    spinner.start('[Ceramic] Starting Ceramic node\n')
    events.on('ceramic', async (isRunning) => {
      if (isRunning) {
        await next()
      }
      if(isRunning === false) {
        ceramic.kill()
        process.exit()
      }
    })
  } catch (err) {
    ceramic.kill()
    spinner.fail(err)
  }
}

start()

process.on("SIGTERM", () => {
  ceramic.kill();
});
process.on("beforeExit", () => {
  ceramic.kill();
});
