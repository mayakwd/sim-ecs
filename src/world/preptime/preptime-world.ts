import type {IPreptimeOptions, IPreptimeWorld, IPreptimeWorldConfig} from "./preptime-world.spec";
import {SerDe} from "../../serde/serde";
import {Scheduler} from "../../scheduler/scheduler";
import {
    buildEntity,
    clearEntities,
    createEntity,
    getEntities,
} from "../common/world_entities";
import {
    clearResources,
    getResource,
    getResources,
    hasResource,
    removeResource,
} from "../common/world_resources";
import {
    addEntitiesToGroup,
    addEntityToGroup,
    assimilateGroup,
    clearGroups,
    createGroup,
    getGroupEntities,
    removeGroup,
} from "../common/world_groups";
import {addEntity, hasEntity, removeEntity} from "./preptime-world_entities";
import {addResource} from "./preptime-world_resources";
import {load, save} from "./preptime-world_prefabs";
import {merge} from "../common/world_misc";
import type {IRuntimeWorld} from "../runtime/runtime-world.spec";
import {RuntimeWorld} from "../runtime/runtime-world";
import {State} from "../../state/state";
import type {IPreptimeData} from "./preptime-world.spec";

export * from "./preptime-world.spec";


export class PreptimeWorld implements IPreptimeWorld {
    public config: IPreptimeWorldConfig;
    public data: IPreptimeData;

    constructor(
        public name?: string,
        $config?: Partial<IPreptimeWorldConfig>,
        $data?: Partial<IPreptimeData>,
    ) {
        {
            const config = $config
                ? $config
                : {};

            this.config = {
                defaultScheduler: config.defaultScheduler ?? new Scheduler(),
                serde: config.serde ?? new SerDe(),
                stateSchedulers: config.stateSchedulers ?? new Map(),
            };
        }

        {
            const data = $data
                ? $data
                : {};

            this.data = {
                entities: data.entities ?? new Set(),
                groups: data.groups ?? {
                    entityLinks: new Map(),
                    nextHandle: 0,
                },
                resources: data.resources ?? new Map(),
            };
        }
    }

    public async prepareRun(options?: Readonly<Partial<IPreptimeOptions>>): Promise<IRuntimeWorld> {
        // todo: don't copy the refs, copy all objects

        const name = this.name
            ? this.name + '_run'
            : 'NO_NAME';

        const runWorld = new RuntimeWorld(
            name,
            Object.assign({
                executionFunction: options?.executionFunction,
                initialState: options?.initialState ?? State,

            }, this.config),
            this.data,
        );

        await runWorld.prepare();
        return runWorld;
    }

    /// ****************************************************************************************************************
    /// Entities
    /// ****************************************************************************************************************
    public addEntity = addEntity;
    public buildEntity = buildEntity;
    public clearEntities = clearEntities;
    public createEntity = createEntity;
    public getEntities = getEntities;
    public hasEntity = hasEntity;
    public removeEntity = removeEntity;

    /// ****************************************************************************************************************
    /// Groups
    /// ****************************************************************************************************************
    public addEntityToGroup = addEntityToGroup;
    public addEntitiesToGroup = addEntitiesToGroup;
    public assimilateGroup = assimilateGroup;
    public clearGroups = clearGroups;
    public createGroup = createGroup;
    public getGroupEntities = getGroupEntities;
    public removeGroup = removeGroup;

    /// ****************************************************************************************************************
    /// Misc
    /// ****************************************************************************************************************
    public merge = merge;

    /// ****************************************************************************************************************
    /// Prefabs
    /// ****************************************************************************************************************
    public load = load;
    public save = save;

    /// ****************************************************************************************************************
    /// Resources
    /// ****************************************************************************************************************
    public addResource = addResource;
    public clearResources = clearResources;
    public getResource = getResource;
    public getResources = getResources;
    public hasResource = hasResource;
    public removeResource = removeResource;
}
