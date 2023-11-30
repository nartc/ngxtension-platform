import { Component, effect } from '@angular/core';
import { injectDocumentVisibility } from '../../../../../libs/ngxtension/document-visibility-state/src/document-visibility-state';

@Component({
	template: `
		{{ visibilityState() }}
	`,
	standalone: true,
})
export default class DocumentVisibilityStateComponent {
	visibilityState = injectDocumentVisibility();

	constructor() {
		effect(() => {
			console.log(this.visibilityState());
		});
	}
}
