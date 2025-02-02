import type IPushDownAutomaton from "./pda.spec";
import type {TTypeProto} from "../_.spec";

export * from "./pda.spec";

type TStateNode<T> = {
    state: T,
    prevNode?: TStateNode<T>,
};

export class PushDownAutomaton<T> implements IPushDownAutomaton<T> {
    protected currentState?: T;
    protected statesTail?: TStateNode<T>;

    get state(): Readonly<T | undefined> {
        return this.currentState;
    }

    clear(): void {
        this.currentState = undefined;
        this.statesTail = undefined;
    }

    pop(): T | undefined {
        if (!this.statesTail) return;

        const oldTail = this.statesTail;

        this.statesTail = this.statesTail.prevNode;
        this.currentState = this.statesTail?.state;

        return oldTail.state;
    }

    push<P extends TTypeProto<T>>(State: P): void {
        this.currentState = new State();
        this.statesTail = {
            prevNode: this.statesTail,
            state: this.currentState,
        };
    }
}
