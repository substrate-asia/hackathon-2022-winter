#!/usr/bin/env zx

import {Command} from 'commander';
import * as gitverse from './src/utils/file.js'

const program = new Command();

program.command('init')
    .description('Initialize empty gitverse repository')
    .action(async () => {
        const repo = await gitverse.InitGitRepo()
        console.log(`Initialized empty gitverse repository (${repo})`)
    })
program.command('add <pathlist...>')
    .description('add code to gitverse repository')
    .action(async (pathlist) => {
        const result = await gitverse.AddGitCode(pathlist)
        if (result) {
            console.log(`add file to gitverse repository`)
        }
    })
program.command('tag <tagName>')
    .description('upload tag code to gitverse repository')
    .action(async (tagName) => {
        await gitverse.UploadGitCodeByTag(tagName)
    })
program.command('commit')
    .option('-m, --comments [comments]')
    .description('commit code to gitverse repository')
    .parse(process.argv)
    .action(async (comments) => {
        let default_comment = "commit code"
        if (process.argv.length == 5) {
            default_comment = process.argv[4]
        }
        await gitverse.UploadGitCodeByCommitID(default_comment)
    })

program.parse(process.argv)
