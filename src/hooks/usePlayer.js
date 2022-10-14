import { useState, useCallback } from "react";

import { TETROMINOS, randomTetromino } from "../tetrominos";
import { STAGE_WIDTH, checkCollision } from "../gameHelpers";

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });

  //This one will take in the tetromino and the direction, and will rotate the tetromino.
  function rotate(matrix, dir) {
    //I'm going to make the rows become columns by transposing them
    const mtrx = matrix.map((_, index) =>
      matrix.map((column) => column[index])
    );
    //I'm going to reverse each row to get a rotated matrix/tetromino
    //+0 is clockwise, -1 is reverse
    if (dir > 0) return mtrx.map((row) => row.reverse());
    return mtrx.reverse();
  }

  function playerRotate(stage, dir) {
    //Does collision detection when i rotate the player, created a copy of player using json.parse and stringify,
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    //this code solves the problem of the tetromino rotating outside of the stage,
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      //this is going to take the tetromino when we rotate it and move it right and left and check if we collide with something, and if no collision happens its impossible to rotate it
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      //checking the first row of the tetromino
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  }
  //This function updates the stage with new X and Y values
  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
      collided,
    }));
  };
  /*This function uses useCallBack, this prevents an infinite loop happening in the useStage hook.  It sets the position to scratch, divide by 2 and subtract by 2 to get the tetromino in the middle, and a random tetromino will be added and grab a random shape */
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  return [player, updatePlayerPos, resetPlayer, playerRotate];
};
