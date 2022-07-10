import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function readLine(questionText: string) {
  return new Promise<string>((resolve) => {
    rl.question(questionText, (input) => resolve(input))
  })
}

export default readLine
