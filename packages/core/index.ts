import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import download from 'download-git-repo';
import template from './template';

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
  const isNeedEslint = await confirm({ message: 'install eslint?' });
  const isEnableTypeScript = await confirm({ message: 'support typescript?' });
  console.log(options.template);
  if (templateEnum.includes(options.template)) {
    const root = generatedUrl(projectName);
    const templateSrc = path.resolve(
      fileURLToPath(import.meta.url),
      '../../boilerplate',
      `template-${options.template}`
    );

    console.log(templateSrc);
    // 复制模板
    copy(templateSrc, root);
  } else {
    // 通过网络下载
    const repo = /^(https).+/i.test(options.template)
      ? options.template
      : `https://${options.template}`;
    downloadBoilerplate(repo);
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

const downloadBoilerplate = (repo: string) => {
  download(repo, '.', { clone: true }, (error) => {
    if (error) {
      throw new Error('下载出错');
    }
  });
};

program.parse();
