import type {IIStateProto, IState} from "../../state/state.spec";
import type {IScheduler} from "../../scheduler/scheduler.spec";
import type {ISerDe} from "../../serde/serde.spec";
import type {IImmutableWorld} from "../world.spec";
import type {IEventBus} from "../../events/event-bus.spec";
import type {ISystemActions, ITransitionActions} from "../actions.spec";
import type {IEntity} from "../../entity/entity.spec";
import {type InstanceMap} from "../../util/instance-map";
import type {TObjectProto, TTypeProto} from "../../_.spec";
import type {TGroupHandle} from "../world.spec";

export * from './commands/commands.spec';


export type TExecutionFunction = ((callback: Function) => any) | typeof setTimeout | typeof requestAnimationFrame;

export interface IRuntimeWorldData {
    entities: Set<IEntity>
    groups: {
        nextHandle: TGroupHandle
        entityLinks: Map<TGroupHandle, Set<IEntity>>
    }
    resources: InstanceMap<TObjectProto>
}

export interface IRuntimeWorldInitData {
    entities: ReadonlySet<Readonly<IEntity>>
    groups: {
        nextHandle: TGroupHandle
        entityLinks: Map<TGroupHandle, ReadonlySet<Readonly<IEntity>>>
    }
    resources: ReadonlyMap<Readonly<object> | TObjectProto, ReadonlyArray<unknown>>
}

export interface IRuntimeWorldInitConfig {
    readonly defaultScheduler: Readonly<IScheduler>
    readonly executionFunction?: TExecutionFunction | undefined
    readonly initialState: IIStateProto
    readonly serde: Readonly<ISerDe>
    readonly stateSchedulers: ReadonlyMap<Readonly<IIStateProto>, Readonly<IScheduler>>
}

export interface IRuntimeWorld extends IImmutableWorld {
    /**
     * Initial config
     */
    readonly config: Readonly<IRuntimeWorldInitConfig>
    /**
     * Advertises the current state
     */
    readonly currentState: Readonly<IState> | undefined
    /**
     * Data to operate on.
     * This data may mutate at any time
     */
    data: Readonly<IRuntimeWorldData>
    /**
     * Boolean indicator if the world is currently executing
     */
    readonly isRunning: boolean
    /**
     * This promise resolves when the execution terminates
     */
    readonly awaiter?: Promise<void>
    /**
     * Architecture to send messages between systems
     */
    readonly eventBus: Readonly<IEventBus>
    /**
     * World's name
     */
    readonly name: string
    /**
     * Object containing all actions available inside a system
     */
    readonly systemActions: Readonly<ISystemActions>
    /**
     * Object containing all actions available on step-to-step transitions, as well as to states
     */
    readonly transitionActions: Readonly<ITransitionActions>

    /**
     * Replace a resource from this world with a new value
     * @param obj
     * @param args
     */
    replaceResource<T extends object>(obj: T | TTypeProto<T>, ...args: ReadonlyArray<unknown>): Promise<void>

    /**
     * Start a continuous execution.
     * The Promise resolves when the execution terminates
     */
    start(): Promise<void>

    /**
     * Execute a single step.
     * The Promise resolves when the execution terminates
     */
    step(): Promise<void>

    /**
     * Terminate execution
     */
    stop(): void
}
