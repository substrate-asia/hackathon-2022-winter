type LiteralLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'log'
type LogLevel = keyof Console & LiteralLogLevel

const padZeroLeft = (i: unknown) => `0${i}`.slice(-2)

export default function createLogger(namespace: string = 'root', level: LogLevel = 'log') {
  const method = console[level]
  return function logger(...args: unknown[]) {
    const now = new Date()
    const time = `${padZeroLeft(now.getHours())}:${padZeroLeft(now.getMinutes())}:${padZeroLeft(now.getSeconds())}`
    method(`[${time}] [${namespace}]`, ...args)
  }
}