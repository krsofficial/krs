import input from "../../input.js"
import sound from "../../sound.js"
import { framesToMs } from "../../shortcuts.js"

export default function firmDrop(arg, frameGravity = 1) {
  if (input.getGameDown("softDrop")) {
    arg.piece.gravityMultiplier = Math.max(
      1,
      arg.piece.gravity / framesToMs(frameGravity)
    )
    if (!arg.piece.isLanded) {
      arg.piece.genPieceParticles()
    }
  } else {
      arg.piece.gravityMultiplier = 1
  }
}
