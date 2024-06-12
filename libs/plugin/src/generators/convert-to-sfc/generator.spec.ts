import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertToSFCGenerator from './generator';
import { ConvertToSFCGeneratorSchema } from './schema';

const template = `<div>Hello</div>
<app-my-cmp1>123</app-my-cmp1>`;

const filesMap = {
	notComponent: `
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {}
`,
	componentNoTemplate: `
import { Component } from '@angular/core';

@Component({})
export class MyCmp {}
`,

	componentWithTemplateUrl: `
import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './my-file.html'
})
export class MyCmp {
}
`,

	componentWithInlineTemplate: `
import { Component, Input } from '@angular/core';

@Component({
  template: \`
    <router-outlet></router-outlet>
  \`
})
export class MyCmp {
}
`,
} as const;

describe('convertToSFCGenerator', () => {
	let tree: Tree;
	const options: ConvertToSFCGeneratorSchema = {
		path: 'libs/my-file.ts',
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.1.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);

		if (file === 'componentWithTemplateUrl') {
			tree.write(`libs/my-file.html`, template);
			return () => {
				return [
					tree.read('libs/my-file.ts', 'utf8'),
					filesMap[file],
					tree.read('libs/my-file.html', 'utf8'),
					template,
				];
			};
		}

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponent');
		await convertToSFCGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no template', async () => {
		const readContent = setup('componentNoTemplate');
		await convertToSFCGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly for templateUrl', async () => {
		const readContent = setup('componentWithTemplateUrl');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});

	it('should skip components with inline templates', async () => {
		const readContent = setup('componentWithInlineTemplate');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});
});
