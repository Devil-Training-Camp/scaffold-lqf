import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import select from '@inquirer/select';
import degit from 'degit';
import ora from 'ora';
import download from 'download-git-repo';
import template from './template';
import { choiceBundler, installPrettier } from './installPackage';
import chalk from 'chalk';

const templateEnum = Object.keys(template);
const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url)).toString()
);

const program = new Command();

program
  .name('scaffold-lqf')
  .description('一个简单的脚手架')
  .version(pkg.version);

program
  .command('create')
  .description('create a project')
  .argument('<string>', 'the project name')
  .option('-s, --store <char>', 'store resource code', '')
  .option('-t, --template <template>', 'choice your framwork', '')
  .action((name, options) => {
    createProject(name, options);
  });

const createProject = async (projectName: string, options: any) => {
  if (options.template === '') {
    options.template = await select({
      message: 'Select a framwork',
      choices: [
        {
          name: 'vanilla',
          value: 'vanilla',
        },
        {
          name: 'vue',
          value: 'vue',
        },
        {
          name: 'react',
          value: 'react',
          disabled: true,
        },
      ],
    });
  }

  let property: string;
  if (templateEnum.includes((property = options.template))) {
    template[property].eslint = await confirm({ message: 'install eslint?' });
    template[property].prettier = await confirm({
      message: 'install prettier?',
    });
    template[property].typescript = await confirm({
      message: 'support typescript?',
    });

    const bundler = await choiceBundler();

    const destDir = generatedUrl(projectName);
    const templateSrc = path.resolve(
      fileURLToPath(import.meta.url),
      '../../boilerplate',
      `template-${property}${template[property].typescript ? '-ts' : ''}`
    );

    // 复制模板
    copy(templateSrc, destDir);

    if (template[property].prettier) {
      process.chdir(projectName);
      installPrettier(bundler, destDir);
    }
  } else {
    downloadBoilerplate(options.template, projectName);
  }
};

const generatedUrl = (projectName: string) => {
  return path.resolve(process.cwd(), projectName);
};

const copy = (src: string, destSrc: string) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, destSrc);
  } else {
    fs.copyFileSync(src, destSrc);
  }
};

const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};

const downloadBoilerplate = (repo: string, projectName: string) => {
  const emitter = degit(repo);

  const spinner = ora(`Download ${chalk.red(repo)}`).start();
  emitter.clone(generatedUrl(projectName)).then(() => {
    spinner.succeed();
  });
};

program.parse();
