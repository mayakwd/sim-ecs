import {type ITransitionActions, queryEntities, SerialFormat, State, type TGroupHandle, With} from "sim-ecs";
import {gamePrefab} from "../prefabs/game";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Position} from "../components/position";
import {GameStore} from "../models/game-store";
import {Velocity} from "../components/velocity";
import {load} from "../app/persistence";
import {Shape} from "../components/shape";
import {UIItem} from "../components/ui-item";
import {ScoreBoard} from "../models/score-board";
import {savablePrefab} from "../prefabs/savable";

export class GameState extends State {
    saveDataPrefabHandle?: TGroupHandle;
    staticDataPrefabHandle?: TGroupHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
    }

    async create(actions: ITransitionActions) {
        const gameStore = actions.getResource(GameStore);

        this.staticDataPrefabHandle = createNewGame(actions);
        if (gameStore.continue) {
            this.saveDataPrefabHandle = load(actions);
        } else {
            this.saveDataPrefabHandle = await createGameFromPrefab(actions);
        }

        await actions.flushCommands();
        setScoreCaptionMod(actions);
    }

    destroy(actions: ITransitionActions) {
        if (this.staticDataPrefabHandle) {
            actions.commands.removeGroup(this.staticDataPrefabHandle);
        }

        if (this.saveDataPrefabHandle) {
            actions.commands.removeGroup(this.saveDataPrefabHandle);
        }

        return actions.flushCommands();
    }
}

const createNewGame = function (actions: ITransitionActions) {
    return actions.commands.load(SerialFormat.fromArray(gamePrefab));
};

const createGameFromPrefab = async function (actions: ITransitionActions) {
    const prefabHandle = actions.commands.load(SerialFormat.fromArray(savablePrefab));
    await actions.flushCommands();

    for (const entity of actions.getEntities(queryEntities(
        With(Paddle),
        With(Shape),
    ))) {
        actions.commands.mutateEntity(entity, entity => {
            entity
                .addComponent(new Position(
                    entity.getComponent(Paddle)!.side == EPaddleSide.Left
                        ? 0
                        : 1 - entity.getComponent(Shape)!.dimensions.width,
                ))
                .addComponent(new Velocity());
            }
        );
    }

    return prefabHandle;
};

const setScoreCaptionMod = function (actions: ITransitionActions) {
    const score = actions.getResource(ScoreBoard);

    for (const entity of actions.getEntities(queryEntities(
        With(Paddle),
        With(UIItem),
    ))) {
        const ui = entity.getComponent(UIItem)!;
        const paddle = entity.getComponent(Paddle)!;

        if (paddle.side == EPaddleSide.Left) {
            ui.captionMod = strIn => strIn.replace('{}', score.left.toString());
        } else {
            ui.captionMod = strIn => strIn.replace('{}', score.right.toString());
        }
    }
};
