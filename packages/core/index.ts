import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';

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
  .option('-t, --target <char>', 'store resource code', '')
  .action((name, options) => {
    createProject(name, options);
  });

const createProject = async (projectName: string, options: any) => {
  const isNeedEslint = await confirm({ message: 'install eslint?' });
  const isEnableTypeScript = await confirm({ message: 'support typescript?' });
  const root = generatedUrl(options.target, projectName);
  const templateSrc = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    'template'
  );
  // 复制模板
  copy(templateSrc, root);
};

const generatedUrl = (target: string, projectName: string) => {
  const targetFullUrl = target
    ? path.join(target, projectName)
    : path.resolve(process.cwd(), projectName);
  return targetFullUrl;
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

program.parse();
