import * as path from "path";
import * as fs from "../async/fs"
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { SolutionProjectType, ProjectInSolution, SolutionFile } from "../model/Solutions";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RenameSolutionItemCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Rename');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new InputTextCommandParameter('新解决方案名称：', item.label)
        ];

        return !!item.solution;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        let projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        try {
            if (!projectInSolution) {
                let name = args[0];
                if (!name.toLowerCase().endsWith('.sln'))
                    name += '.sln';
                
                await this.renameFile(item.solution.FullPath, name);

                this.provider.logger.log("已重命名解决方案：" + name);
                this.provider.refresh();
            } else {
                let data: string = await fs.readFile(item.solution.FullPath, 'utf8');
                let lines: string[] = data.split('\n'); 

                lines.some((l, index) => {
                    if (l.indexOf('"' + item.label + '"') >= 0) {
                        let aux = l;
                        while(aux.indexOf('"' + item.label + '"') >= 0) {
                            aux = aux.replace('"' + item.label + '"', '"' + args[0] + '"')
                        }
                        lines.splice(index, 1, aux);
                        return true;
                    }
                    return false;
                });
                
                if (item.project) {
                    let ext = path.extname(item.project.fullPath);
                    let sourceName = item.project.fullPath.replace(path.dirname(item.project.fullPath), '');
                    if (sourceName.startsWith(path.sep)) 
                        sourceName = sourceName.substring(1);
                    
                    let name = args[0];
                    if (!name.toLowerCase().endsWith(ext))
                        name += ext;

                    await this.renameFile(item.project.fullPath, name);

                    lines.some((l, index) => {
                        if (l.indexOf(sourceName) >= 0) {
                            let aux = l.replace(sourceName, name);
                            lines.splice(index, 1, aux);
                            return true;
                        }
                        return false;
                    });
                }

                await fs.writeFile(item.solution.FullPath, lines.join('\n'));
                this.provider.logger.log("解决方案已移动");
            }
        } catch(ex) {
            this.provider.logger.error('未能重命名：' + ex);
        }    
    }

    private async renameFile(fullpath: string, name: string): Promise<string> {
        let folder = path.dirname(fullpath);
        let newItempath = path.join(folder, name);
        await fs.rename(fullpath, newItempath);
        return newItempath;
    }
}