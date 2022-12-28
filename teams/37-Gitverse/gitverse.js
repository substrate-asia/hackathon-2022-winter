#!/usr/bin/env zx

import {$} from "zx";
import { Command } from 'commander';
import * as gitversefile from './src/utils/file.js'

const program = new Command();

program.command('init')
      .description('Initialized empty GitVerse repository')
      .action(async()=>{
         gitversefile.InitGitRepo()
         console.log('Initialized empty GitVerse repository success')
      })
program.command('add <pathlist...>')
      .description('add code to gitverse repo')
      .action(async(pathlist)=>{
         gitversefile.AddGitCode(pathlist)
         console.log('add code to gitverse repo success')
      })
program.command('tag <tagName>')
      .description('upload tag code to gitverse repo')
      .action(async(tagName)=>{
      gitversefile.UploadGitCodeByTag(tagName)
      console.log('upload tag code from gitverse repo success')
      })
program.command('commit')
      .option('-m, --comments [comments]')
      .description('commit code to gitverse repo')
      .parse(process.argv)
      .action(async(comments)=>{
         let default_comment = "commit code"
         if (process.argv.length == 5) {
            default_comment = process.argv[4]
         }
         gitversefile.UploadGitCodeByCommitID(default_comment)
         console.log('commit code to gitverse repo success')
      })

program.parse(process.argv)