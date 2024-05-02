import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertQueriesGenerator from './generator';
import { ConvertContentQueriesGeneratorSchema } from './schema';

describe('convertQueriesGenerator', () => {
	let tree: Tree;
	const options: ConvertContentQueriesGeneratorSchema = {
		path: 'libs/my-file.ts',
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.3.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponentNorDirective');
		await convertQueriesGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should pass primeng component test', async () => {
		const readContent = setup('primeNgComponent');
		await convertQueriesGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly', async () => {
		const readContent = setup('component');
		await convertQueriesGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should not do anything if not queries', async () => {
		const readContent = setup('componentNoQueries');
		await convertQueriesGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});
});

const filesMap = {
	notComponentNorDirective: `
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {}
`,
	componentNoQueries: `
import { Component } from '@angular/core';

@Component({})
export class MyCmp {}
`,
	primeNgComponent: `
import { Component, Output, EventEmitter, ViewChild, ContentChildren } from '@angular/core';

@Component({
  template: \`
   <div
            #container
            [ngClass]="{
                'p-treetable p-component': true,
                'p-treetable-hoverable-rows': rowHover || selectionMode === 'single' || selectionMode === 'multiple',
                'p-treetable-auto-layout': autoLayout,
                'p-treetable-resizable': resizableColumns,
                'p-treetable-resizable-fit': resizableColumns && columnResizeMode === 'fit',
                'p-treetable-flex-scrollable': scrollable && scrollHeight === 'flex'
            }"
        >
            <div class="p-treetable-loading" *ngIf="loading && showLoader">
                <div class="p-treetable-loading-overlay p-component-overlay">
                    <i *ngIf="loadingIcon" [class]="'p-treetable-loading-icon pi-spin ' + loadingIcon"></i>
                    <ng-container *ngIf="!loadingIcon">
                        <SpinnerIcon *ngIf="!loadingIconTemplate" [spin]="true" [styleClass]="'p-treetable-loading-icon'" />
                        <span *ngIf="loadingIconTemplate" class="p-treetable-loading-icon">
                            <ng-template *ngTemplateOutlet="loadingIconTemplate"></ng-template>
                        </span>
                    </ng-container>
                </div>
            </div>
            <div *ngIf="captionTemplate" class="p-treetable-header">
                <ng-container *ngTemplateOutlet="captionTemplate"></ng-container>
            </div>
            <p-paginator
                [rows]="rows"
                [first]="first"
                [totalRecords]="totalRecords"
                [pageLinkSize]="pageLinks"
                styleClass="p-paginator-top"
                [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="onPageChange($event)"
                [rowsPerPageOptions]="rowsPerPageOptions"
                *ngIf="paginator && (paginatorPosition === 'top' || paginatorPosition == 'both')"
                [templateLeft]="paginatorLeftTemplate"
                [templateRight]="paginatorRightTemplate"
                [dropdownAppendTo]="paginatorDropdownAppendTo"
                [currentPageReportTemplate]="currentPageReportTemplate"
                [showFirstLastIcon]="showFirstLastIcon"
                [dropdownItemTemplate]="paginatorDropdownItemTemplate"
                [showCurrentPageReport]="showCurrentPageReport"
                [showJumpToPageDropdown]="showJumpToPageDropdown"
                [showPageLinks]="showPageLinks"
                [styleClass]="paginatorStyleClass"
                [locale]="paginatorLocale"
            >
                <ng-template pTemplate="firstpagelinkicon" *ngIf="paginatorFirstPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorFirstPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="previouspagelinkicon" *ngIf="paginatorPreviousPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorPreviousPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="lastpagelinkicon" *ngIf="paginatorLastPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorLastPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="nextpagelinkicon" *ngIf="paginatorNextPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorNextPageLinkIconTemplate"></ng-container>
                </ng-template>
            </p-paginator>

            <div class="p-treetable-wrapper" *ngIf="!scrollable">
                <table role="table" #table [ngClass]="tableStyleClass" [ngStyle]="tableStyle">
                    <ng-container *ngTemplateOutlet="colGroupTemplate; context: { $implicit: columns }"></ng-container>
                    <thead role="rowgroup" class="p-treetable-thead">
                        <ng-container *ngTemplateOutlet="headerTemplate; context: { $implicit: columns }"></ng-container>
                    </thead>
                    <tbody class="p-treetable-tbody" role="rowgroup" [pTreeTableBody]="columns" [pTreeTableBodyTemplate]="bodyTemplate"></tbody>
                    <tfoot class="p-treetable-tfoot" role="rowgroup">
                        <ng-container *ngTemplateOutlet="footerTemplate; context: { $implicit: columns }"></ng-container>
                    </tfoot>
                </table>
            </div>

            <div class="p-treetable-scrollable-wrapper" *ngIf="scrollable">
                <div
                    class="p-treetable-scrollable-view p-treetable-frozen-view"
                    *ngIf="frozenColumns || frozenBodyTemplate"
                    #scrollableFrozenView
                    [ttScrollableView]="frozenColumns"
                    [frozen]="true"
                    [ngStyle]="{ width: frozenWidth }"
                    [scrollHeight]="scrollHeight"
                ></div>
                <div class="p-treetable-scrollable-view" #scrollableView [ttScrollableView]="columns" [frozen]="false" [scrollHeight]="scrollHeight" [ngStyle]="{ left: frozenWidth, width: 'calc(100% - ' + frozenWidth + ')' }"></div>
            </div>

            <p-paginator
                [rows]="rows"
                [first]="first"
                [totalRecords]="totalRecords"
                [pageLinkSize]="pageLinks"
                styleClass="p-paginator-bottom"
                [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="onPageChange($event)"
                [rowsPerPageOptions]="rowsPerPageOptions"
                *ngIf="paginator && (paginatorPosition === 'bottom' || paginatorPosition == 'both')"
                [templateLeft]="paginatorLeftTemplate"
                [templateRight]="paginatorRightTemplate"
                [dropdownAppendTo]="paginatorDropdownAppendTo"
                [currentPageReportTemplate]="currentPageReportTemplate"
                [showFirstLastIcon]="showFirstLastIcon"
                [dropdownItemTemplate]="paginatorDropdownItemTemplate"
                [showCurrentPageReport]="showCurrentPageReport"
                [showJumpToPageDropdown]="showJumpToPageDropdown"
                [showPageLinks]="showPageLinks"
                [styleClass]="paginatorStyleClass"
                [locale]="paginatorLocale"
            >
                <ng-template pTemplate="firstpagelinkicon" *ngIf="paginatorFirstPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorFirstPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="previouspagelinkicon" *ngIf="paginatorPreviousPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorPreviousPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="lastpagelinkicon" *ngIf="paginatorLastPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorLastPageLinkIconTemplate"></ng-container>
                </ng-template>

                <ng-template pTemplate="nextpagelinkicon" *ngIf="paginatorNextPageLinkIconTemplate">
                    <ng-container *ngTemplateOutlet="paginatorNextPageLinkIconTemplate"></ng-container>
                </ng-template>
            </p-paginator>
            <div *ngIf="summaryTemplate" class="p-treetable-footer">
                <ng-container *ngTemplateOutlet="summaryTemplate"></ng-container>
            </div>

            <div #resizeHelper class="p-column-resizer-helper" style="display:none" *ngIf="resizableColumns"></div>
            <span #reorderIndicatorUp class="p-treetable-reorder-indicator-up" style="display: none;" *ngIf="reorderableColumns">
                <ArrowDownIcon *ngIf="!reorderIndicatorUpIconTemplate" />
                <ng-template *ngTemplateOutlet="reorderIndicatorUpIconTemplate"></ng-template>
            </span>
            <span #reorderIndicatorDown class="p-treetable-reorder-indicator-down" style="display: none;" *ngIf="reorderableColumns">
                <ArrowUpIcon *ngIf="!reorderIndicatorDownIconTemplate" />
                <ng-template *ngTemplateOutlet="reorderIndicatorDownIconTemplate"></ng-template>
            </span>
        </div>
  \`
})
export class MyCmp {

    @ViewChild('container') containerViewChild: Nullable<ElementRef>;

    @ViewChild('resizeHelper') resizeHelperViewChild: Nullable<ElementRef>;

    @ViewChild('reorderIndicatorUp') reorderIndicatorUpViewChild: Nullable<ElementRef>;

    @ViewChild('reorderIndicatorDown') reorderIndicatorDownViewChild: Nullable<ElementRef>;

    @ViewChild('table') tableViewChild: Nullable<ElementRef>;

    @ViewChild('scrollableView') scrollableViewChild: Nullable<ElementRef>;

    @ViewChild('scrollableFrozenView', { read: ElementRef }) scrollableFrozenViewChild: Nullable<ElementRef>;

    @ContentChildren(PrimeTemplate) templates: Nullable<QueryList<PrimeTemplate>>;

    @ContentChildren(PrimeTemplate) templates123: QueryList<PrimeTemplate>;

    _value: TreeNode<any>[] | undefined = [];

    _virtualRowHeight: number = 28;

    _selectionKeys: any;

    serializedValue: any[] | undefined | null;

    _totalRecords: number = 0;

    _multiSortMeta: SortMeta[] | undefined | null;

    _sortField: string | undefined | null;

    _sortOrder: number = 1;

    filteredNodes: Nullable<any[]>;

    filterTimeout: any;

    colGroupTemplate: Nullable<TemplateRef<any>>;

    captionTemplate: Nullable<TemplateRef<any>>;

    headerTemplate: Nullable<TemplateRef<any>>;

    bodyTemplate: Nullable<TemplateRef<any>>;

    footerTemplate: Nullable<TemplateRef<any>>;

    summaryTemplate: Nullable<TemplateRef<any>>;

    emptyMessageTemplate: Nullable<TemplateRef<any>>;

    paginatorLeftTemplate: Nullable<TemplateRef<any>>;

    paginatorRightTemplate: Nullable<TemplateRef<any>>;

    paginatorDropdownItemTemplate: Nullable<TemplateRef<any>>;

    frozenHeaderTemplate: Nullable<TemplateRef<any>>;

    frozenBodyTemplate: Nullable<TemplateRef<any>>;

    frozenFooterTemplate: Nullable<TemplateRef<any>>;

    frozenColGroupTemplate: Nullable<TemplateRef<any>>;

    loadingIconTemplate: Nullable<TemplateRef<any>>;

    reorderIndicatorUpIconTemplate: Nullable<TemplateRef<any>>;

    reorderIndicatorDownIconTemplate: Nullable<TemplateRef<any>>;

    sortIconTemplate: Nullable<TemplateRef<any>>;

    checkboxIconTemplate: Nullable<TemplateRef<any>>;

    headerCheckboxIconTemplate: Nullable<TemplateRef<any>>;

    togglerIconTemplate: Nullable<TemplateRef<any>>;

    paginatorFirstPageLinkIconTemplate: Nullable<TemplateRef<any>>;

    paginatorLastPageLinkIconTemplate: Nullable<TemplateRef<any>>;

    paginatorPreviousPageLinkIconTemplate: Nullable<TemplateRef<any>>;

    paginatorNextPageLinkIconTemplate: Nullable<TemplateRef<any>>;

    lastResizerHelperX: Nullable<number>;

    reorderIconWidth: Nullable<number>;

    reorderIconHeight: Nullable<number>;

    draggedColumn: Nullable<any[]>;

    dropPosition: Nullable<number>;

    preventSelectionSetterPropagation: Nullable<boolean>;

    _selection: any;

    selectedKeys: any = {};

    rowTouched: Nullable<boolean>;

    editingCell: Nullable<Element>;

    editingCellData: any | undefined | null;

    editingCellField: any | undefined | null;

    editingCellClick: Nullable<boolean>;

    documentEditListener: VoidListener;

    initialized: Nullable<boolean>;

    toggleRowIndex: Nullable<number>;

    ngOnInit() {
        if (this.lazy && this.lazyLoadOnInit && !this.virtualScroll) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
        this.initialized = true;
    }

    ngAfterContentInit() {
        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'caption':
                    this.captionTemplate = item.template;
                    break;

                case 'header':
                    this.headerTemplate = item.template;
                    break;

                case 'body':
                    this.bodyTemplate = item.template;
                    break;

                case 'footer':
                    this.footerTemplate = item.template;
                    break;

                case 'summary':
                    this.summaryTemplate = item.template;
                    break;

                case 'colgroup':
                    this.colGroupTemplate = item.template;
                    break;

                case 'emptymessage':
                    this.emptyMessageTemplate = item.template;
                    break;

                case 'paginatorleft':
                    this.paginatorLeftTemplate = item.template;
                    break;

                case 'paginatorright':
                    this.paginatorRightTemplate = item.template;
                    break;

                case 'paginatordropdownitem':
                    this.paginatorDropdownItemTemplate = item.template;
                    break;

                case 'frozenheader':
                    this.frozenHeaderTemplate = item.template;
                    break;

                case 'frozenbody':
                    this.frozenBodyTemplate = item.template;
                    break;

                case 'frozenfooter':
                    this.frozenFooterTemplate = item.template;
                    break;

                case 'frozencolgroup':
                    this.frozenColGroupTemplate = item.template;
                    break;

                case 'loadingicon':
                    this.loadingIconTemplate = item.template;
                    break;

                case 'reorderindicatorupicon':
                    this.reorderIndicatorUpIconTemplate = item.template;
                    break;

                case 'reorderindicatordownicon':
                    this.reorderIndicatorDownIconTemplate = item.template;
                    break;

                case 'sorticon':
                    this.sortIconTemplate = item.template;
                    break;

                case 'checkboxicon':
                    this.checkboxIconTemplate = item.template;
                    break;

                case 'headercheckboxicon':
                    this.headerCheckboxIconTemplate = item.template;
                    break;

                case 'togglericon':
                    this.togglerIconTemplate = item.template;
                    break;

                case 'paginatorfirstpagelinkicon':
                    this.paginatorFirstPageLinkIconTemplate = item.template;
                    break;

                case 'paginatorlastpagelinkicon':
                    this.paginatorLastPageLinkIconTemplate = item.template;
                    break;

                case 'paginatorpreviouspagelinkicon':
                    this.paginatorPreviousPageLinkIconTemplate = item.template;
                    break;

                case 'paginatornextpagelinkicon':
                    this.paginatorNextPageLinkIconTemplate = item.template;
                    break;
            }
        });
    }

    constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, public el: ElementRef, public cd: ChangeDetectorRef, public zone: NgZone, public tableService: TreeTableService, public filterService: FilterService) {}

    ngOnChanges(simpleChange: SimpleChanges) {
        if (simpleChange.value) {
            this._value = simpleChange.value.currentValue;

            if (!this.lazy) {
                this.totalRecords = this._value ? this._value.length : 0;

                if (this.sortMode == 'single' && this.sortField) this.sortSingle();
                else if (this.sortMode == 'multiple' && this.multiSortMeta) this.sortMultiple();
                else if (this.hasFilter())
                    //sort already filters
                    this._filter();
            }

            this.updateSerializedValue();
            this.tableService.onUIUpdate(this.value);
        }

        if (simpleChange.sortField) {
            this._sortField = simpleChange.sortField.currentValue;

            //avoid triggering lazy load prior to lazy initialization at onInit
            if (!this.lazy || this.initialized) {
                if (this.sortMode === 'single') {
                    this.sortSingle();
                }
            }
        }

        if (simpleChange.sortOrder) {
            this._sortOrder = simpleChange.sortOrder.currentValue;

            //avoid triggering lazy load prior to lazy initialization at onInit
            if (!this.lazy || this.initialized) {
                if (this.sortMode === 'single') {
                    this.sortSingle();
                }
            }
        }

        if (simpleChange.multiSortMeta) {
            this._multiSortMeta = simpleChange.multiSortMeta.currentValue;
            if (this.sortMode === 'multiple') {
                this.sortMultiple();
            }
        }

        if (simpleChange.selection) {
            this._selection = simpleChange.selection.currentValue;

            if (!this.preventSelectionSetterPropagation) {
                this.updateselectedKeys();
                this.tableService.onSelectionChange();
            }
            this.preventSelectionSetterPropagation = false;
        }
    }

    updateSerializedValue() {
        this.serializedValue = [];

        if (this.paginator) this.serializePageNodes();
        else this.serializeNodes(null, this.filteredNodes || this.value, 0, true);
    }

    serializeNodes(parent: Nullable<TreeTableNode>, nodes: Nullable<TreeNode[]>, level: Nullable<number>, visible: Nullable<boolean>) {
        if (nodes && nodes.length) {
            for (let node of nodes) {
                node.parent = <TreeTableNode>parent;
                const rowNode = {
                    node: node,
                    parent: parent,
                    level: level,
                    visible: visible && (parent ? parent.expanded : true)
                };
                (<TreeNode[]>this.serializedValue).push(<TreeTableNode>rowNode);

                if (rowNode.visible && node.expanded) {
                    this.serializeNodes(node, node.children, <number>level + 1, rowNode.visible);
                }
            }
        }
    }

    serializePageNodes() {
        let data = this.filteredNodes || this.value;
        this.serializedValue = [];
        if (data && data.length) {
            const first = this.lazy ? 0 : this.first;

            for (let i = first; i < first + <number>this.rows; i++) {
                let node = data[i];
                if (node) {
                    this.serializedValue.push({
                        node: node,
                        parent: <any>null,
                        level: 0,
                        visible: true
                    });

                    this.serializeNodes(node, node.children, 1, true);
                }
            }
        }
    }

    updateselectedKeys() {
        if (this.dataKey && this._selection) {
            this.selectedKeys = {};
            if (Array.isArray(this._selection)) {
                for (let node of this._selection) {
                    this.selectedKeys[String(ObjectUtils.resolveFieldData(node.data, this.dataKey))] = 1;
                }
            } else {
                this.selectedKeys[String(ObjectUtils.resolveFieldData((<any>this._selection).data, this.dataKey))] = 1;
            }
        }
    }

    onPageChange(event: TreeTablePaginatorState) {
        this.first = <number>event.first;
        this.rows = <number>event.rows;

        if (this.lazy) this.onLazyLoad.emit(this.createLazyLoadMetadata());
        else this.serializePageNodes();

        this.onPage.emit({
            first: this.first,
            rows: this.rows
        });

        this.tableService.onUIUpdate(this.value);

        if (this.scrollable) {
            this.resetScrollTop();
        }
    }

    sort(event: TreeTableSortEvent) {
        let originalEvent = event.originalEvent;

        if (this.sortMode === 'single') {
            this._sortOrder = this.sortField === event.field ? this.sortOrder * -1 : this.defaultSortOrder;
            this._sortField = event.field;
            this.sortSingle();

            if (this.resetPageOnSort && this.scrollable) {
                this.resetScrollTop();
            }
        }
        if (this.sortMode === 'multiple') {
            let metaKey = (<KeyboardEvent>originalEvent).metaKey || (<KeyboardEvent>originalEvent).ctrlKey;
            let sortMeta = this.getSortMeta(<string>event.field);

            if (sortMeta) {
                if (!metaKey) {
                    this._multiSortMeta = [{ field: <string>event.field, order: sortMeta.order * -1 }];

                    if (this.resetPageOnSort && this.scrollable) {
                        this.resetScrollTop();
                    }
                } else {
                    sortMeta.order = sortMeta.order * -1;
                }
            } else {
                if (!metaKey || !this.multiSortMeta) {
                    this._multiSortMeta = [];

                    if (this.resetPageOnSort && this.scrollable) {
                        this.resetScrollTop();
                    }
                }
                (<SortMeta[]>this.multiSortMeta).push({ field: <string>event.field, order: this.defaultSortOrder });
            }

            this.sortMultiple();
        }
    }

    sortSingle() {
        if (this.sortField && this.sortOrder) {
            if (this.lazy) {
                this.onLazyLoad.emit(this.createLazyLoadMetadata());
            } else if (this.value) {
                this.sortNodes(this.value);

                if (this.hasFilter()) {
                    this._filter();
                }
            }

            let sortMeta: SortMeta = {
                field: this.sortField,
                order: this.sortOrder
            };

            this.onSort.emit(sortMeta);
            this.tableService.onSort(sortMeta);
            this.updateSerializedValue();
        }
    }

    sortNodes(nodes: TreeNode[]) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        if (this.customSort) {
            this.sortFunction.emit({
                data: nodes,
                mode: this.sortMode,
                field: <string>this.sortField,
                order: this.sortOrder
            });
        } else {
            nodes.sort((node1, node2) => {
                let value1 = ObjectUtils.resolveFieldData(node1.data, this.sortField);
                let value2 = ObjectUtils.resolveFieldData(node2.data, this.sortField);
                let result = null;

                if (value1 == null && value2 != null) result = -1;
                else if (value1 != null && value2 == null) result = 1;
                else if (value1 == null && value2 == null) result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2, undefined, { numeric: true });
                else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                return this.sortOrder * result;
            });
        }

        for (let node of nodes) {
            this.sortNodes(node.children as TreeNode[]);
        }
    }

    sortMultiple() {
        if (this.multiSortMeta) {
            if (this.lazy) {
                this.onLazyLoad.emit(this.createLazyLoadMetadata());
            } else if (this.value) {
                this.sortMultipleNodes(this.value);

                if (this.hasFilter()) {
                    this._filter();
                }
            }

            this.onSort.emit({
                multisortmeta: this.multiSortMeta
            });
            this.updateSerializedValue();
            this.tableService.onSort(this.multiSortMeta);
        }
    }

    sortMultipleNodes(nodes: TreeNode[]) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        if (this.customSort) {
            this.sortFunction.emit({
                data: this.value,
                mode: this.sortMode,
                multiSortMeta: this.multiSortMeta
            });
        } else {
            nodes.sort((node1, node2) => {
                return this.multisortField(node1, node2, <SortMeta[]>this.multiSortMeta, 0);
            });
        }

        for (let node of nodes) {
            this.sortMultipleNodes(node.children as TreeNode[]);
        }
    }

    multisortField(node1: TreeTableNode, node2: TreeTableNode, multiSortMeta: SortMeta[], index: number): number {
        if (ObjectUtils.isEmpty(this.multiSortMeta) || ObjectUtils.isEmpty(multiSortMeta[index])) {
            return 0;
        }

        let value1 = ObjectUtils.resolveFieldData(node1.data, multiSortMeta[index].field);
        let value2 = ObjectUtils.resolveFieldData(node2.data, multiSortMeta[index].field);
        let result = null;

        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        if (typeof value1 == 'string' || value1 instanceof String) {
            if (value1.localeCompare && value1 != value2) {
                return multiSortMeta[index].order * value1.localeCompare(value2, undefined, { numeric: true });
            }
        } else {
            result = value1 < value2 ? -1 : 1;
        }

        if (value1 == value2) {
            return multiSortMeta.length - 1 > index ? this.multisortField(node1, node2, multiSortMeta, index + 1) : 0;
        }

        return multiSortMeta[index].order * <number>result;
    }

    getSortMeta(field: string) {
        if (this.multiSortMeta && this.multiSortMeta.length) {
            for (let i = 0; i < this.multiSortMeta.length; i++) {
                if (this.multiSortMeta[i].field === field) {
                    return this.multiSortMeta[i];
                }
            }
        }

        return null;
    }

    isSorted(field: string) {
        if (this.sortMode === 'single') {
            return this.sortField && this.sortField === field;
        } else if (this.sortMode === 'multiple') {
            let sorted = false;
            if (this.multiSortMeta) {
                for (let i = 0; i < this.multiSortMeta.length; i++) {
                    if (this.multiSortMeta[i].field == field) {
                        sorted = true;
                        break;
                    }
                }
            }
            return sorted;
        }
    }

    createLazyLoadMetadata(): any {
        return {
            first: this.first,
            rows: this.rows,
            sortField: this.sortField,
            sortOrder: this.sortOrder,
            filters: this.filters,
            globalFilter: this.filters && this.filters['global'] ? this.filters['global'].value : null,
            multiSortMeta: this.multiSortMeta,
            forceUpdate: () => this.cd.detectChanges()
        };
    }

    onLazyItemLoad(event: TreeTableLazyLoadEvent) {
        this.onLazyLoad.emit({
            ...this.createLazyLoadMetadata(),
            ...event,
            rows: event.last - event.first
        });
    }
    /**
     * Resets scroll to top.
     * @group Method
     */
    public resetScrollTop() {
        if (this.virtualScroll) this.scrollToVirtualIndex(0);
        else this.scrollTo({ top: 0 });
    }
    /**
     * Scrolls to given index when using virtual scroll.
     * @param {number} index - index of the element.
     * @group Method
     */
    public scrollToVirtualIndex(index: number) {
        if (this.scrollableViewChild) {
            (<any>this.scrollableViewChild).scrollToVirtualIndex(<number>index);
        }

        if (this.scrollableFrozenViewChild) {
            (<any>this.scrollableViewChild).scrollToVirtualIndex(index);
        }
    }
    /**
     * Scrolls to given index.
     * @param {ScrollToOptions} options - Scroll options.
     * @group Method
     */
    public scrollTo(options: ScrollToOptions) {
        if (this.scrollableViewChild) {
            (<any>this.scrollableViewChild).scrollTo(options);
        }

        if (this.scrollableFrozenViewChild) {
            (<any>this.scrollableViewChild).scrollTo(options);
        }
    }

    isEmpty() {
        let data = this.filteredNodes || this.value;
        return data == null || data.length == 0;
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    onColumnResizeBegin(event: MouseEvent) {
        let containerLeft = DomHandler.getOffset(this.containerViewChild?.nativeElement).left;
        this.lastResizerHelperX = event.pageX - containerLeft + this.containerViewChild?.nativeElement.scrollLeft;
        event.preventDefault();
    }

    onColumnResize(event: MouseEvent) {
        let containerLeft = DomHandler.getOffset(this.containerViewChild?.nativeElement).left;
        DomHandler.addClass(this.containerViewChild?.nativeElement, 'p-unselectable-text');
        (<ElementRef>this.resizeHelperViewChild).nativeElement.style.height = this.containerViewChild?.nativeElement.offsetHeight + 'px';
        (<ElementRef>this.resizeHelperViewChild).nativeElement.style.top = 0 + 'px';
        (<ElementRef>this.resizeHelperViewChild).nativeElement.style.left = event.pageX - containerLeft + this.containerViewChild?.nativeElement.scrollLeft + 'px';

        (<ElementRef>this.resizeHelperViewChild).nativeElement.style.display = 'block';
    }

    onColumnResizeEnd(event: MouseEvent, column: any) {
        let delta = (<ElementRef>this.resizeHelperViewChild).nativeElement.offsetLeft - <number>this.lastResizerHelperX;
        let columnWidth = column.offsetWidth;
        let newColumnWidth = columnWidth + delta;
        let minWidth = column.style.minWidth || 15;

        if (columnWidth + delta > parseInt(minWidth)) {
            if (this.columnResizeMode === 'fit') {
                let nextColumn = column.nextElementSibling;
                while (!nextColumn.offsetParent) {
                    nextColumn = nextColumn.nextElementSibling;
                }

                if (nextColumn) {
                    let nextColumnWidth = nextColumn.offsetWidth - delta;
                    let nextColumnMinWidth = nextColumn.style.minWidth || 15;

                    if (newColumnWidth > 15 && nextColumnWidth > parseInt(nextColumnMinWidth)) {
                        if (this.scrollable) {
                            let scrollableView = this.findParentScrollableView(column);
                            let scrollableBodyTable = DomHandler.findSingle(scrollableView, '.p-treetable-scrollable-body table') || DomHandler.findSingle(scrollableView, '.p-scroller-viewport table');
                            let scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-header-table');
                            let scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-footer-table');
                            let resizeColumnIndex = DomHandler.index(column);

                            this.resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                            this.resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                            this.resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                        } else {
                            column.style.width = newColumnWidth + 'px';
                            if (nextColumn) {
                                nextColumn.style.width = nextColumnWidth + 'px';
                            }
                        }
                    }
                }
            } else if (this.columnResizeMode === 'expand') {
                if (this.scrollable) {
                    let scrollableView = this.findParentScrollableView(column);
                    let scrollableBody = DomHandler.findSingle(scrollableView, '.p-treetable-scrollable-body') || DomHandler.findSingle(scrollableView, '.p-scroller-viewport');
                    let scrollableHeader = DomHandler.findSingle(scrollableView, '.p-treetable-scrollable-header');
                    let scrollableFooter = DomHandler.findSingle(scrollableView, '.p-treetable-scrollable-footer');
                    let scrollableBodyTable = DomHandler.findSingle(scrollableView, '.p-treetable-scrollable-body table') || DomHandler.findSingle(scrollableView, '.p-scroller-viewport table');
                    let scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-header-table');
                    let scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-footer-table');
                    scrollableBodyTable.style.width = scrollableBodyTable.offsetWidth + delta + 'px';
                    scrollableHeaderTable.style.width = scrollableHeaderTable.offsetWidth + delta + 'px';
                    if (scrollableFooterTable) {
                        scrollableFooterTable.style.width = scrollableFooterTable.offsetWidth + delta + 'px';
                    }
                    let resizeColumnIndex = DomHandler.index(column);

                    const scrollableBodyTableWidth = column ? scrollableBodyTable.offsetWidth + delta : newColumnWidth;
                    const scrollableHeaderTableWidth = column ? scrollableHeaderTable.offsetWidth + delta : newColumnWidth;
                    const isContainerInViewport = this.containerViewChild?.nativeElement.offsetWidth >= scrollableBodyTableWidth;

                    let setWidth = (container: HTMLElement, table: HTMLElement, width: number, isContainerInViewport: boolean) => {
                        if (container && table) {
                            container.style.width = isContainerInViewport ? width + DomHandler.calculateScrollbarWidth(scrollableBody) + 'px' : 'auto';
                            table.style.width = width + 'px';
                        }
                    };

                    setWidth(scrollableBody, scrollableBodyTable, scrollableBodyTableWidth, isContainerInViewport);
                    setWidth(scrollableHeader, scrollableHeaderTable, scrollableHeaderTableWidth, isContainerInViewport);
                    setWidth(scrollableFooter, scrollableFooterTable, scrollableHeaderTableWidth, isContainerInViewport);

                    this.resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, null);
                    this.resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, null);
                    this.resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, null);
                } else {
                    (<ElementRef>this.tableViewChild).nativeElement.style.width = this.tableViewChild?.nativeElement.offsetWidth + delta + 'px';
                    column.style.width = newColumnWidth + 'px';
                    let containerWidth = this.tableViewChild?.nativeElement.style.width;
                    (<ElementRef>this.containerViewChild).nativeElement.style.width = containerWidth + 'px';
                }
            }

            this.onColResize.emit({
                element: column,
                delta: delta
            });
        }

        (this.resizeHelperViewChild as ElementRef).nativeElement.style.display = 'none';
        DomHandler.removeClass(this.containerViewChild?.nativeElement, 'p-unselectable-text');
    }

    findParentScrollableView(column: any) {
        if (column) {
            let parent = column.parentElement;
            while (parent && !DomHandler.hasClass(parent, 'p-treetable-scrollable-view')) {
                parent = parent.parentElement;
            }

            return parent;
        } else {
            return null;
        }
    }

    resizeColGroup(table: Nullable<HTMLElement>, resizeColumnIndex: Nullable<number>, newColumnWidth: Nullable<number>, nextColumnWidth: Nullable<number>) {
        if (table) {
            let colGroup = table.children[0].nodeName === 'COLGROUP' ? table.children[0] : null;

            if (colGroup) {
                let col = colGroup.children[<number>resizeColumnIndex];
                let nextCol = col.nextElementSibling;
                (<HTMLElement>col).style.width = newColumnWidth + 'px';

                if (nextCol && nextColumnWidth) {
                    (<HTMLElement>nextCol).style.width = nextColumnWidth + 'px';
                }
            } else {
                throw 'Scrollable tables require a colgroup to support resizable columns';
            }
        }
    }

    onColumnDragStart(event: DragEvent, columnElement: any) {
        this.reorderIconWidth = DomHandler.getHiddenElementOuterWidth(this.reorderIndicatorUpViewChild?.nativeElement);
        this.reorderIconHeight = DomHandler.getHiddenElementOuterHeight(this.reorderIndicatorDownViewChild?.nativeElement);
        this.draggedColumn = columnElement;
        (<any>event).dataTransfer.setData('text', 'b'); // For firefox
    }

    onColumnDragEnter(event: DragEvent, dropHeader: any) {
        if (this.reorderableColumns && this.draggedColumn && dropHeader) {
            event.preventDefault();
            let containerOffset = DomHandler.getOffset(this.containerViewChild?.nativeElement);
            let dropHeaderOffset = DomHandler.getOffset(dropHeader);

            if (this.draggedColumn != dropHeader) {
                let targetLeft = dropHeaderOffset.left - containerOffset.left;
                let targetTop = containerOffset.top - dropHeaderOffset.top;
                let columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

                (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.top = dropHeaderOffset.top - containerOffset.top - (<number>this.reorderIconHeight - 1) + 'px';
                (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.top = dropHeaderOffset.top - containerOffset.top + dropHeader.offsetHeight + 'px';

                if (event.pageX > columnCenter) {
                    (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.left = targetLeft + dropHeader.offsetWidth - Math.ceil(<number>this.reorderIconWidth / 2) + 'px';
                    (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.left = targetLeft + dropHeader.offsetWidth - Math.ceil(<number>this.reorderIconWidth / 2) + 'px';
                    this.dropPosition = 1;
                } else {
                    (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.left = targetLeft - Math.ceil(<number>this.reorderIconWidth / 2) + 'px';
                    (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.left = targetLeft - Math.ceil(<number>this.reorderIconWidth / 2) + 'px';
                    this.dropPosition = -1;
                }

                (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.display = 'block';
                (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.display = 'block';
            } else {
                (<any>event).dataTransfer.dropEffect = 'none';
            }
        }
    }

    onColumnDragLeave(event: DragEvent) {
        if (this.reorderableColumns && this.draggedColumn) {
            event.preventDefault();
            (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.display = 'none';
            (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.display = 'none';
        }
    }

    onColumnDrop(event: DragEvent, dropColumn: any) {
        event.preventDefault();
        if (this.draggedColumn) {
            let dragIndex = DomHandler.indexWithinGroup(this.draggedColumn, 'ttreorderablecolumn');
            let dropIndex = DomHandler.indexWithinGroup(dropColumn, 'ttreorderablecolumn');
            let allowDrop = dragIndex != dropIndex;
            if (allowDrop && ((dropIndex - dragIndex == 1 && this.dropPosition === -1) || (dragIndex - dropIndex == 1 && this.dropPosition === 1))) {
                allowDrop = false;
            }

            if (allowDrop && dropIndex < dragIndex && this.dropPosition === 1) {
                dropIndex = dropIndex + 1;
            }

            if (allowDrop && dropIndex > dragIndex && this.dropPosition === -1) {
                dropIndex = dropIndex - 1;
            }

            if (allowDrop) {
                ObjectUtils.reorderArray(<any[]>this.columns, dragIndex, dropIndex);

                this.onColReorder.emit({
                    dragIndex: dragIndex,
                    dropIndex: dropIndex,
                    columns: this.columns
                });
            }

            (<ElementRef>this.reorderIndicatorUpViewChild).nativeElement.style.display = 'none';
            (<ElementRef>this.reorderIndicatorDownViewChild).nativeElement.style.display = 'none';
            (this.draggedColumn as any).draggable = false;
            this.draggedColumn = null;
            this.dropPosition = null;
        }
    }

    handleRowClick(event: any) {
        let targetNode = (<HTMLElement>event.originalEvent.target).nodeName;
        if (targetNode == 'INPUT' || targetNode == 'BUTTON' || targetNode == 'A' || DomHandler.hasClass(event.originalEvent.target, 'p-clickable')) {
            return;
        }

        if (this.selectionMode) {
            this.preventSelectionSetterPropagation = true;
            let rowNode = event.rowNode;
            let selected = this.isSelected((<any>rowNode).node);
            let metaSelection = this.rowTouched ? false : this.metaKeySelection;
            let dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData((<TreeTableNode>rowNode.node).data, this.dataKey)) : null;

            if (metaSelection) {
                let keyboardEvent = <KeyboardEvent>event.originalEvent;
                let metaKey = keyboardEvent.metaKey || keyboardEvent.ctrlKey;

                if (selected && metaKey) {
                    if (this.isSingleSelectionMode()) {
                        this._selection = null;
                        this.selectedKeys = {};
                        this.selectionChange.emit(null);
                    } else {
                        let selectionIndex = this.findIndexInSelection(rowNode.node);
                        this._selection = this.selection.filter((val: TreeTableNode, i: number) => i != selectionIndex);
                        this.selectionChange.emit(this.selection);
                        if (dataKeyValue) {
                            delete this.selectedKeys[dataKeyValue];
                        }
                    }

                    this.onNodeUnselect.emit({ originalEvent: event.originalEvent, node: <TreeTableNode>rowNode.node, type: 'row' });
                } else {
                    if (this.isSingleSelectionMode()) {
                        this._selection = rowNode.node;
                        this.selectionChange.emit(rowNode.node);
                        if (dataKeyValue) {
                            this.selectedKeys = {};
                            this.selectedKeys[dataKeyValue] = 1;
                        }
                    } else if (this.isMultipleSelectionMode()) {
                        if (metaKey) {
                            this._selection = this.selection || [];
                        } else {
                            this._selection = [];
                            this.selectedKeys = {};
                        }

                        this._selection = [...this.selection, rowNode.node];
                        this.selectionChange.emit(this.selection);
                        if (dataKeyValue) {
                            this.selectedKeys[dataKeyValue] = 1;
                        }
                    }

                    this.onNodeSelect.emit({ originalEvent: event.originalEvent, node: rowNode.node, type: 'row', index: (<any>event).rowIndex });
                }
            } else {
                if (this.selectionMode === 'single') {
                    if (selected) {
                        this._selection = null;
                        this.selectedKeys = {};
                        this.selectionChange.emit(this.selection);
                        this.onNodeUnselect.emit({ originalEvent: event.originalEvent, node: <TreeTableNode>rowNode.node, type: 'row' });
                    } else {
                        this._selection = rowNode.node;
                        this.selectionChange.emit(this.selection);
                        this.onNodeSelect.emit({ originalEvent: event.originalEvent, node: rowNode.node, type: 'row', index: event.rowIndex });
                        if (dataKeyValue) {
                            this.selectedKeys = {};
                            this.selectedKeys[dataKeyValue] = 1;
                        }
                    }
                } else if (this.selectionMode === 'multiple') {
                    if (selected) {
                        let selectionIndex = this.findIndexInSelection(rowNode.node);
                        this._selection = this.selection.filter((val: TreeTableNode, i: number) => i != selectionIndex);
                        this.selectionChange.emit(this.selection);
                        this.onNodeUnselect.emit({ originalEvent: event.originalEvent, node: rowNode.node, type: 'row' });
                        if (dataKeyValue) {
                            delete this.selectedKeys[dataKeyValue];
                        }
                    } else {
                        this._selection = this.selection ? [...this.selection, rowNode.node] : [rowNode.node];
                        this.selectionChange.emit(this.selection);
                        this.onNodeSelect.emit({ originalEvent: event.originalEvent, node: rowNode.node, type: 'row', index: event.rowIndex });
                        if (dataKeyValue) {
                            this.selectedKeys[dataKeyValue] = 1;
                        }
                    }
                }
            }

            this.tableService.onSelectionChange();
        }

        this.rowTouched = false;
    }

    handleRowTouchEnd(event: Event) {
        this.rowTouched = true;
    }

    handleRowRightClick(event: any) {
        if (this.contextMenu) {
            const node = event.rowNode.node;

            if (this.contextMenuSelectionMode === 'separate') {
                this.contextMenuSelection = node;
                this.contextMenuSelectionChange.emit(node);
                this.onContextMenuSelect.emit({ originalEvent: event.originalEvent, node: node });
                this.contextMenu.show(event.originalEvent);
                this.tableService.onContextMenu(node);
            } else if (this.contextMenuSelectionMode === 'joint') {
                this.preventSelectionSetterPropagation = true;
                let selected = this.isSelected(node);
                let dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(node.data, this.dataKey)) : null;

                if (!selected) {
                    if (this.isSingleSelectionMode()) {
                        this.selection = node;
                        this.selectionChange.emit(node);
                    } else if (this.isMultipleSelectionMode()) {
                        this.selection = [node];
                        this.selectionChange.emit(this.selection);
                    }

                    if (dataKeyValue) {
                        this.selectedKeys[dataKeyValue] = 1;
                    }
                }

                this.contextMenu.show(event.originalEvent);
                this.onContextMenuSelect.emit({ originalEvent: event.originalEvent, node: node });
            }
        }
    }

    toggleNodeWithCheckbox(event: any) {
        // legacy selection support, will be removed in v18
        this.selection = this.selection || [];
        this.preventSelectionSetterPropagation = true;
        let node = event.rowNode.node;
        let selected = this.isSelected(node);

        if (selected) {
            this.propagateSelectionDown(node, false);
            if (event.rowNode.parent) {
                this.propagateSelectionUp(node.parent, false);
            }
            this.selectionChange.emit(this.selection);
            this.onNodeUnselect.emit({ originalEvent: event, node: node });
        } else {
            this.propagateSelectionDown(node, true);
            if (event.rowNode.parent) {
                this.propagateSelectionUp(node.parent, true);
            }
            this.selectionChange.emit(this.selection);
            this.onNodeSelect.emit({ originalEvent: event, node: node });
        }

        this.tableService.onSelectionChange();
    }

    toggleNodesWithCheckbox(event: Event, check: boolean) {
        // legacy selection support, will be removed in v18
        let data = this.filteredNodes || this.value;
        this._selection = check && data ? data.slice() : [];

        this.toggleAll(check);

        if (!check) {
            this._selection = [];
            this.selectedKeys = {};
        }

        this.preventSelectionSetterPropagation = true;
        this.selectionChange.emit(this._selection);
        this.tableService.onSelectionChange();

        this.onHeaderCheckboxToggle.emit({ originalEvent: event, checked: check });
    }

    toggleAll(checked: boolean) {
        let data = this.filteredNodes || this.value;

        if (!this.selectionKeys) {
            if (data && data.length) {
                for (let node of data) {
                    this.propagateSelectionDown(node, checked);
                }
            }
        } else {
            // legacy selection support, will be removed in v18
            if (data && data.length) {
                for (let node of data) {
                    this.propagateDown(node, checked);
                }
                this.selectionKeysChange.emit(this.selectionKeys);
            }
        }
    }

    propagateSelectionUp(node: TreeTableNode, select: boolean) {
        // legacy selection support, will be removed in v18
        if (node.children && node.children.length) {
            let selectedChildCount: number = 0;
            let childPartialSelected: boolean = false;
            let dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(node.data, this.dataKey)) : null;

            for (let child of node.children) {
                if (this.isSelected(child)) selectedChildCount++;
                else if (child.partialSelected) childPartialSelected = true;
            }

            if (select && selectedChildCount == node.children.length) {
                this._selection = [...(this.selection || []), node];
                node.partialSelected = false;
                if (dataKeyValue) {
                    this.selectedKeys[dataKeyValue] = 1;
                }
            } else {
                if (!select) {
                    let index = this.findIndexInSelection(node);
                    if (index >= 0) {
                        this._selection = this.selection.filter((val: any, i: number) => i != index);

                        if (dataKeyValue) {
                            delete this.selectedKeys[dataKeyValue];
                        }
                    }
                }

                if (childPartialSelected || (selectedChildCount > 0 && selectedChildCount != node.children.length)) node.partialSelected = true;
                else node.partialSelected = false;
            }
        }

        let parent = node.parent;
        node.checked = select;
        if (parent) {
            this.propagateSelectionUp(parent, select);
        }
    }

    propagateSelectionDown(node: TreeTableNode, select: boolean) {
        // legacy selection support, will be removed in v18
        let index = this.findIndexInSelection(node);
        let dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(node.data, this.dataKey)) : null;

        if (select && index == -1) {
            this._selection = [...(this.selection || []), node];
            if (dataKeyValue) {
                this.selectedKeys[dataKeyValue] = 1;
            }
        } else if (!select && index > -1) {
            this._selection = this.selection.filter((val: any, i: number) => i != index);
            if (dataKeyValue) {
                delete this.selectedKeys[dataKeyValue];
            }
        }

        node.partialSelected = false;
        node.checked = select;

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateSelectionDown(child, select);
            }
        }
    }

    isSelected(node: TreeTableNode) {
        // legacy selection support, will be removed in v18
        if (node && this.selection) {
            if (this.dataKey) {
                if (node.hasOwnProperty('checked')) {
                    return node['checked'];
                } else {
                    return this.selectedKeys[ObjectUtils.resolveFieldData(node.data, this.dataKey)] !== undefined;
                }
            } else {
                if (Array.isArray(this.selection)) return this.findIndexInSelection(node) > -1;
                else return this.equals(node, this.selection);
            }
        }

        return false;
    }

    isNodeSelected(node) {
        return this.selectionMode && this.selectionKeys ? this.selectionKeys[this.nodeKey(node)]?.checked === true : false;
    }

    isNodePartialSelected(node) {
        return this.selectionMode && this.selectionKeys ? this.selectionKeys[this.nodeKey(node)]?.partialChecked === true : false;
    }

    nodeKey(node) {
        return ObjectUtils.resolveFieldData(node, this.dataKey) || ObjectUtils.resolveFieldData(node?.data, this.dataKey);
    }

    toggleCheckbox(event) {
        let { rowNode, check, originalEvent } = event;
        let node = rowNode.node;
        if (this.selectionKeys) {
            this.propagateDown(node, check);
            if (node.parent) {
                this.propagateUp(node.parent, check);
            }

            this.selectionKeysChange.emit(this.selectionKeys);
        } else {
            this.toggleNodeWithCheckbox({ originalEvent, rowNode });
        }

        this.tableService.onSelectionChange();
    }

    propagateDown(node, check) {
        if (check) {
            this.selectionKeys[this.nodeKey(node)] = { checked: true, partialChecked: false };
        } else {
            delete this.selectionKeys[this.nodeKey(node)];
        }

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateDown(child, check);
            }
        }
    }

    propagateUp(node, check) {
        let checkedChildCount = 0;
        let childPartialSelected = false;

        for (let child of node.children) {
            if (this.selectionKeys[this.nodeKey(child)] && this.selectionKeys[this.nodeKey(child)].checked) checkedChildCount++;
            else if (this.selectionKeys[this.nodeKey(child)] && this.selectionKeys[this.nodeKey(child)].partialChecked) childPartialSelected = true;
        }

        if (check && checkedChildCount === node.children.length) {
            this.selectionKeys[this.nodeKey(node)] = { checked: true, partialChecked: false };
        } else {
            if (!check) {
                delete this.selectionKeys[this.nodeKey(node)];
            }

            if (childPartialSelected || (checkedChildCount > 0 && checkedChildCount !== node.children.length)) this.selectionKeys[this.nodeKey(node)] = { checked: false, partialChecked: true };
            else this.selectionKeys[this.nodeKey(node)] = { checked: false, partialChecked: false };
        }

        let parent = node.parent;
        if (parent) {
            this.propagateUp(parent, check);
        }
    }

    findIndexInSelection(node: any) {
        let index: number = -1;
        if (this.selection && this.selection.length) {
            for (let i = 0; i < this.selection.length; i++) {
                if (this.equals(node, this.selection[i])) {
                    index = i;
                    break;
                }
            }
        }

        return index;
    }

    isSingleSelectionMode() {
        return this.selectionMode === 'single';
    }

    isMultipleSelectionMode() {
        return this.selectionMode === 'multiple';
    }

    equals(node1: TreeTableNode, node2: TreeTableNode) {
        return this.compareSelectionBy === 'equals' ? ObjectUtils.equals(node1, node2) : ObjectUtils.equals(node1.data, node2.data, this.dataKey);
    }

    filter(value: string | string[], field: string, matchMode: string) {
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }

        if (!this.isFilterBlank(value)) {
            this.filters[field] = { value: value, matchMode: matchMode };
        } else if (this.filters[field]) {
            delete this.filters[field];
        }

        this.filterTimeout = setTimeout(() => {
            this._filter();
            this.filterTimeout = null;
        }, this.filterDelay);
    }

    filterGlobal(value: string, matchMode: string) {
        this.filter(value, 'global', matchMode);
    }

    isFilterBlank(filter: any): boolean {
        if (filter !== null && filter !== undefined) {
            if ((typeof filter === 'string' && filter.trim().length == 0) || (Array.isArray(filter) && filter.length == 0)) return true;
            else return false;
        }
        return true;
    }

    _filter() {
        if (this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        } else {
            if (!this.value) {
                return;
            }

            if (!this.hasFilter()) {
                this.filteredNodes = null;
                if (this.paginator) {
                    this.totalRecords = this.value ? this.value.length : 0;
                }
            } else {
                let globalFilterFieldsArray;
                if (this.filters['global']) {
                    if (!this.columns && !this.globalFilterFields) throw new Error('Global filtering requires dynamic columns or globalFilterFields to be defined.');
                    else globalFilterFieldsArray = this.globalFilterFields || this.columns;
                }

                this.filteredNodes = [];
                const isStrictMode = this.filterMode === 'strict';
                let isValueChanged = false;

                for (let node of this.value) {
                    let copyNode = { ...node };
                    let localMatch = true;
                    let globalMatch = false;
                    let paramsWithoutNode;

                    for (let prop in this.filters) {
                        if (this.filters.hasOwnProperty(prop) && prop !== 'global') {
                            let filterMeta = <FilterMetadata>this.filters[prop];
                            let filterField = prop;
                            let filterValue = filterMeta.value;
                            let filterMatchMode = filterMeta.matchMode || 'startsWith';
                            let filterConstraint = (<any>this.filterService).filters[filterMatchMode];
                            paramsWithoutNode = { filterField, filterValue, filterConstraint, isStrictMode };
                            if (
                                (isStrictMode && !(this.findFilteredNodes(copyNode, paramsWithoutNode) || this.isFilterMatched(copyNode, paramsWithoutNode))) ||
                                (!isStrictMode && !(this.isFilterMatched(copyNode, paramsWithoutNode) || this.findFilteredNodes(copyNode, paramsWithoutNode)))
                            ) {
                                localMatch = false;
                            }

                            if (!localMatch) {
                                break;
                            }
                        }
                    }

                    if (this.filters['global'] && !globalMatch && globalFilterFieldsArray) {
                        let copyNodeForGlobal = { ...copyNode };
                        let filterField = undefined;
                        let filterValue = this.filters['global'].value;
                        let filterConstraint = (<any>this.filterService).filters[(<any>this.filters)['global'].matchMode];
                        paramsWithoutNode = { filterField, filterValue, filterConstraint, isStrictMode, globalFilterFieldsArray };

                        if (
                            (isStrictMode && (this.findFilteredNodes(copyNodeForGlobal, paramsWithoutNode) || this.isFilterMatched(copyNodeForGlobal, paramsWithoutNode))) ||
                            (!isStrictMode && (this.isFilterMatched(copyNodeForGlobal, paramsWithoutNode) || this.findFilteredNodes(copyNodeForGlobal, paramsWithoutNode)))
                        ) {
                            globalMatch = true;
                            copyNode = copyNodeForGlobal;
                        }
                    }

                    let matches = localMatch;
                    if (this.filters['global']) {
                        matches = localMatch && globalMatch;
                    }

                    if (matches) {
                        this.filteredNodes.push(copyNode);
                    }

                    isValueChanged = isValueChanged || !localMatch || globalMatch || (localMatch && this.filteredNodes.length > 0) || (!globalMatch && this.filteredNodes.length === 0);
                }

                if (!isValueChanged) {
                    this.filteredNodes = null;
                }

                if (this.paginator) {
                    this.totalRecords = this.filteredNodes ? this.filteredNodes.length : this.value ? this.value.length : 0;
                }
            }
            this.cd.markForCheck();
        }

        this.first = 0;

        const filteredValue = this.filteredNodes || this.value;

        this.onFilter.emit({
            filters: this.filters,
            filteredValue: filteredValue
        });

        this.tableService.onUIUpdate(filteredValue);
        this.updateSerializedValue();

        if (this.scrollable) {
            this.resetScrollTop();
        }
    }

    findFilteredNodes(node: TreeTableNode, paramsWithoutNode: any) {
        if (node) {
            let matched = false;
            if (node.children) {
                let childNodes = [...node.children];
                node.children = [];
                for (let childNode of childNodes) {
                    let copyChildNode = { ...childNode };
                    if (this.isFilterMatched(copyChildNode, paramsWithoutNode)) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                }
            }

            if (matched) {
                return true;
            }
        }
    }

    isFilterMatched(node: TreeTableNode, filterOptions: TreeTableFilterOptions) {
        let { filterField, filterValue, filterConstraint, isStrictMode, globalFilterFieldsArray } = <any>filterOptions;
        let matched = false;
        const isMatched = (field: string) => filterConstraint(ObjectUtils.resolveFieldData(node.data, field), filterValue, <string>this.filterLocale);

        matched = globalFilterFieldsArray?.length ? globalFilterFieldsArray.some((globalFilterField) => isMatched(globalFilterField.field || globalFilterField)) : isMatched(filterField);

        if (!matched || (isStrictMode && !this.isNodeLeaf(node))) {
            matched = this.findFilteredNodes(node, { filterField, filterValue, filterConstraint, isStrictMode, globalFilterFieldsArray }) || matched;
        }

        return matched;
    }

    isNodeLeaf(node: TreeTableNode) {
        return node.leaf === false ? false : !(node.children && node.children.length);
    }

    hasFilter() {
        let empty = true;
        for (let prop in this.filters) {
            if (this.filters.hasOwnProperty(prop)) {
                empty = false;
                break;
            }
        }

        return !empty;
    }
    /**
     * Clears the sort and paginator state.
     * @group Method
     */
    public reset() {
        this._sortField = null;
        this._sortOrder = 1;
        this._multiSortMeta = null;
        this.tableService.onSort(null);

        this.filteredNodes = null;
        this.filters = {};

        this.first = 0;

        if (this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        } else {
            this.totalRecords = this._value ? this._value.length : 0;
        }
    }

    updateEditingCell(cell: any, data: any, field: string) {
        this.editingCell = cell;
        this.editingCellData = data;
        this.editingCellField = field;
        this.bindDocumentEditListener();
    }

    isEditingCellValid() {
        return this.editingCell && DomHandler.find(this.editingCell, '.ng-invalid.ng-dirty').length === 0;
    }

    bindDocumentEditListener() {
        if (!this.documentEditListener) {
            this.documentEditListener = this.renderer.listen(this.document, 'click', (event) => {
                if (this.editingCell && !this.editingCellClick && this.isEditingCellValid()) {
                    DomHandler.removeClass(this.editingCell, 'p-cell-editing');
                    this.editingCell = null;
                    this.onEditComplete.emit({ field: this.editingCellField, data: this.editingCellData });
                    this.editingCellField = null;
                    this.editingCellData = null;
                    this.unbindDocumentEditListener();
                }

                this.editingCellClick = false;
            });
        }
    }

    unbindDocumentEditListener() {
        if (this.documentEditListener) {
            this.documentEditListener();
            this.documentEditListener = null;
        }
    }

    ngOnDestroy() {
        this.unbindDocumentEditListener();
        this.editingCell = null;
        this.editingCellField = null;
        this.editingCellData = null;
        this.initialized = null;
    }
}
`,
	component: `
import { Component, ContentChild, ContentChildren, ViewChild, ViewChildren, QueryList } from '@angular/core';

@Component({
  template: \`
    <ng-content></ng-content>

    <div>
        @for (item of templates; trackBy: trackByFn) {
          <ng-container *ngTemplateOutlet="footerFacet; context: { $implicit: item }"></ng-container>
        }
    </div>

   <ng-container
        *ngTemplateOutlet="headerTemplate1; context: { $implicit: item }">
    />

    <ng-container
        *ngTemplateOutlet="headerTemplate1; context: { $implicit: item }">
    />


    <some-component [bodyTemplate]="bodyTemplate" />

   \`
})
export class MyCmp {

    @ContentChild(BODY_TOKEN, { static: true }) bodyTemplate;
    @ContentChild(MxButton) loginButton: MxButton;
    @ContentChild('header') headerTemplate1: TemplateRef<any>;
    @ContentChild(Footer, { read: TemplateRef, descendants: true }) footerFacet: TemplateRef<any>;
    @ContentChildren(PrimeTemplate) templates: Nullable<QueryList<PrimeTemplate>>;

    @ContentChildren(Header) headerFacet!: QueryList<Header>;
    @ContentChildren(PrimeTemplate) templates1!: QueryList<PrimeTemplate>;
    @ViewChildren(PrimeTemplate, { read: ElementRef }) templates2!: QueryList<ElementRef>;

    @ViewChildren(PrimeTemplate, { read: ElementRef }) set _templates3(templates2: QueryList<ElementRef>) {
      console.log('doSomethingWith', templates3);
    }

    @ViewChild('container', { read: ElementRef }) containerViewChild: ElementRef;
    @ViewChild('resizeHelper') resizeHelperViewChild: Nullable<ElementRef>;
    @ViewChild('reorderIndicatorUp') reorderIndicatorUpViewChild: Nullable<ElementRef>;
    @ViewChild('reorderIndicatorDown') reorderIndicatorDownViewChild: Nullable<ElementRef>;
    @ViewChild('table') tableViewChild: Nullable<ElementRef>;
    @ViewChild('scrollableView') scrollableViewChild: Nullable<ElementRef>;
    @ViewChild('scrollableFrozenView') scrollableFrozenViewChild: Nullable<ElementRef>;


    @ContentChildren(CdkTreeNodeOutlet, {
      // We need to use \`descendants: true\`, because Ivy will no longer match
      // indirect descendants if it's left as false.
      descendants: true,
    })
    nodeOutlet: QueryList<CdkTreeNodeOutlet>;

    ngAfterContentInit() {
        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerTemplate = item.template;
                    break;
            }
        });

       this.templates1.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;

                case 'header':
                    this.headerTemplate = item.template;
                    break;
            }
        });

        this.nodeOutlet.changes
          .pipe(takeUntil(this._destroyed))
          .subscribe(() => this.updateChildrenNodes());
          
        this.nodeOutlet.changes.pipe(takeUntil(this._destroyed))
          .subscribe(() => this.updateChildrenNodes());

        doSomethingWithThisButton(this.loginButton);
    }

    ngOnDestroy() {
        this.templates1.forEach((item) => {
          item.destroy();
        });
    }

}
`,
} as const;
