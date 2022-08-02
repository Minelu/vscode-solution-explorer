import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { TreeItemContext } from "../TreeItemContext";

export class NoSolutionTreeItem extends TreeItem {
    constructor(context: TreeItemContext, rootPath: string) {
        super(context, '未找到解决方案（右击鼠标以创建）', TreeItemCollapsibleState.None, ContextValues.NoSolution, rootPath);
        this.iconPath = null;
    }
}