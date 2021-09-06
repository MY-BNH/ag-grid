import { Constants } from '../../constants/constants';
import { PostConstruct, PreDestroy } from '../../context/context';
import { ensureDomOrder } from '../../utils/dom';
import { getAllValuesInObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { BodyDropTarget } from '../bodyDropTarget';
import { HeaderRowComp } from '../headerRow/headerRowComp';
import { HeaderRowCtrl } from '../headerRow/headerRowCtrl';
import { HeaderRowContainerCtrl, IHeaderRowContainerComp } from './headerRowContainerCtrl';

export class HeaderRowContainer extends Component {

    private static PINNED_LEFT_TEMPLATE =  /* html */ `<div class="ag-pinned-left-header" role="presentation"/>`;

    private static PINNED_RIGHT_TEMPLATE =  /* html */ `<div class="ag-pinned-right-header" role="presentation"/>`;

    private static CENTER_TEMPLATE =  /* html */ 
        `<div class="ag-header-viewport" role="presentation">
            <div class="ag-header-container" ref="eContainer" role="rowgroup"></div>
        </div>`;

    @RefSelector('eContainer') private eContainer: HTMLElement;

    private pinned: string | null;

    private headerRowComps: {[ctrlId: string]: HeaderRowComp} = {};
    private rowCompsList: HeaderRowComp[] = [];

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
    }

    @PostConstruct
    private init(): void {
        this.selectAndSetTemplate();

        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.setupDragAndDrop();

        const compProxy: IHeaderRowContainerComp = {
            setCenterWidth: width => this.eContainer.style.width = width,
            setContainerTransform: transform => this.eContainer.style.transform = transform,
            setContainerWidth: width => {
                const container = this.getContainer();
                container.style.width = width;
                container.style.maxWidth = width;
                container.style.minWidth = width;
            },
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setCtrls: ctrls => this.setCtrls(ctrls),

            // temp pass through
            getRowComps: ()=> this.getRowComps()
        };

        const ctrl = this.createManagedBean(new HeaderRowContainerCtrl(this.pinned));
        ctrl.setComp(compProxy);
    }

    private selectAndSetTemplate(): void {
        const pinnedLeft = this.pinned == Constants.PINNED_LEFT;
        const pinnedRight = this.pinned == Constants.PINNED_RIGHT;

        const template = pinnedLeft ? HeaderRowContainer.PINNED_LEFT_TEMPLATE : 
                         pinnedRight ? HeaderRowContainer.PINNED_RIGHT_TEMPLATE : HeaderRowContainer.CENTER_TEMPLATE;

        this.setTemplate(template);
    }

    private getContainer(): HTMLElement {
        return this.eContainer ? this.eContainer : this.getGui();
    }

    public getRowComps(): HeaderRowComp[] {
        return this.rowCompsList;
    }

    private setupDragAndDrop(): void {
        const dropContainer = this.getGui();
        const bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
    }

    @PreDestroy
    private destroyRowComps(): void {
        this.setCtrls([]);
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        this.destroyBean(rowComp);
        this.getContainer().removeChild(rowComp.getGui());
    }

    private setCtrls(ctrls: HeaderRowCtrl[]): void {

        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};
        this.rowCompsList = [];

        const eContainer = this.getContainer();
        let prevGui: HTMLElement;

        const appendEnsuringDomOrder = (rowComp: HeaderRowComp) => {
            const eGui = rowComp.getGui();

            const notAlreadyIn = eGui.parentElement!=eContainer;
            if (notAlreadyIn) {
                eContainer.appendChild(eGui);
            }
            if (prevGui) {
                ensureDomOrder(eContainer, eGui, prevGui);
            }

            prevGui = eGui;
        };

        ctrls.forEach(ctrl => {
            const ctrlId = ctrl.getInstanceId();
            const existingComp =  oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ? existingComp : this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;
            this.rowCompsList.push(rowComp);

            appendEnsuringDomOrder(rowComp);
        });

        getAllValuesInObject(oldRowComps).forEach(c => this.destroyRowComp(c));
    }
}