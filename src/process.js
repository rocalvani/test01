import {Command} from 'commander'

const program = new Command()

program
    .option('-d', 'Variable para debug', false)
    .option('-p <port>', 'Puerto del server', 8080)
    .option('--mode <mode>', 'Modo de trabajo', 'dev')
    .option('--dao <mode>', 'Persistencia', "mongodb")
    .requiredOption('-u <user>', 'Usuario', 'user')

program.parse()

export default program