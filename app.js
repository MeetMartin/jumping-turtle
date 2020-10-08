document.addEventListener('DOMContentLoaded', () => {
    const Store = {
        storage: {
            isJumping: false,
            position: 250,
            isGameOver: false
        },
        set: prop => value =>  Store.storage[prop] = value,
        get: prop => Store.storage[prop],
        changePosition : value => Store.storage.position = (Store.storage.position + value) * 0.9
    };

const querySelector = selector => L.Either.try(() => document.querySelector(selector));
const failOnNothing = L.flatMap(value => L.isNothing(value) ? L.Either.Failure('Element does not exist.') : L.Either.Success(value));
const selectDOM = L.compose(failOnNothing, querySelector);
const setUpPosition = change => L.map(value => value.style.top = change + 'px');
const appendChild = child => L.flatMap(value => L.Either.try(value.appendChild(child.value)));

const turtle = selectDOM('.Turtle');
const grid = selectDOM('.grid');
const body = selectDOM('body');
const alert = selectDOM('#alert');

const onArrowUp = event =>
    L.isEqual(event.keyCode)(38)
    && !Store.get('isJumping')
    && Store.set('isJumping')(true)
    && jumpTurtle();

const KeyUpSyncEffect =
    L.SyncEffect
        .of(() =>
            document.addEventListener('keydown', onArrowUp)
        );

const jumpAsync = change =>
    L.AsyncEffect.of(reject => resolve => value => {
        let counter = 0;
        let intervalID = setInterval(() => {
            L.isEqual(counter)(15)
                ? clearInterval(intervalID)
                || resolve(Store.get('position'))
                : setUpPosition(Store.changePosition(change))(turtle)
                && counter++;
        }, 30);
    });

const jumpTurtle = () => jumpAsync(-5).trigger(L.log)(() => jumpAsync(30).trigger(L.log)(() => Store.set('isJumping')(false))())();

const stoneImage = 'images/stone.png';

const createStone = () => L.Either.of(document.createElement('img'));

const generateObstacles = () => {
    let obstaclePosition = 4000;
    const obstacle = createStone();
    L.map(a => a.src = stoneImage)(obstacle);
    L.map(a => a.classList = 'obstacle')(obstacle);
    L.map(a => a.style.left = obstaclePosition + 'px')(obstacle);
    if (!Store.get('isGameOver')) appendChild(obstacle)(grid);
    console.log('default', obstaclePosition, Store.get('position'))
    let timerId = setInterval(() => {
        if (obstaclePosition > 185 && obstaclePosition < 205 && Store.get('position') > 150) {
            console.log('died', obstaclePosition, Store.get('position'))
            clearInterval(timerId);
            L.map(a => a.innerHTML = 'Game Over')(alert);
            Store.set('isGameOver')(true);
            //remove all children
            //body.removeChild(body.firstChild)
            /*while (grid.firstChild) {
                grid.removeChild(grid.lastChild)
            }*/

        }
        obstaclePosition -=10;
        L.map(a => a.style.left = obstaclePosition + 'px')(obstacle)
    },20)
    if (!Store.get('isGameOver')) setTimeout(generateObstacles, Math.random() * 4000);
};

KeyUpSyncEffect.trigger(); // starts listening to arrow up
generateObstacles();
});