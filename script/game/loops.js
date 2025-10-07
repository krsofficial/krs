import $, {
  bpmToMs,
  framesToMs,
  resetAnimation,
  roundBpmToMs,
  roundMsToFrames,
} from "../shortcuts.js"
import {
  gravity,
  classicGravity,
  deluxeGravity,
} from "./loop-modules/gravity.js"
import { PIECE_COLORS, SOUND_SETS } from "../consts.js"
import addStaticScore from "./loop-modules/add-static-score.js"
import arcadeScore from "./loop-modules/arcade-score.js"
import collapse from "./loop-modules/collapse.js"
import firmDrop from "./loop-modules/firm-drop.js"
import tgmSoftDrop from "./loop-modules/tgm-soft-drop.js"
import krsSoftDrop from "./loop-modules/krs-soft-drop.js"
import krsHardDrop from "./loop-modules/krs-hard-drop.js"
import gameHandler from "./game-handler.js"
import handheldDasAre from "./loop-modules/handheld-das-are.js"
import hardDrop from "./loop-modules/hard-drop.js"
import hold from "./loop-modules/hold.js"
import hyperSoftDrop from "./loop-modules/hyper-soft-drop.js"
import initialDas from "./loop-modules/initial-das.js"
import initialHold from "./loop-modules/initial-hold.js"
import initialRotation from "./loop-modules/initial-rotation.js"
import linesToLevel from "./loop-modules/lines-to-level.js"
import lockFlash from "./loop-modules/lock-flash.js"
import respawnPiece from "./loop-modules/respawn-piece.js"
import rotate from "./loop-modules/rotate.js"
import rotate180 from "./loop-modules/rotate-180.js"
import shifting from "./loop-modules/shifting.js"
import shiftingRetro from "./loop-modules/shifting-retro.js"
import sonicDrop from "./loop-modules/sonic-drop.js"
import softDrop from "./loop-modules/soft-drop.js"
import softDropRetro from "./loop-modules/soft-drop-retro.js"
import softDropNes from "./loop-modules/soft-drop-nes.js"
import sound from "../sound.js"
import updateLasts from "./loop-modules/update-lasts.js"
import {
  extendedLockdown,
  retroLockdown,
  classicLockdown,
  infiniteLockdown,
  beatLockdown,
  zenLockdown,
  krsLockdown,
} from "./loop-modules/lockdown.js"
import updateFallSpeed from "./loop-modules/update-fallspeed.js"
import shiftingNes from "./loop-modules/shifting-nes.js"
import nesDasAre from "./loop-modules/nes-das-are.js"
import settings from "../settings.js"
import input from "../input.js"
import locale from "../lang.js"
import rotateReverse from "./loop-modules/rotate-reverse.js"
let lastLevel = 0
let garbageTimer = 0
let shown20GMessage = false
let shownHoldWarning = false
let lastSeenI = 0
let lastBravos = 0
let lastGrade = ""
let rtaGoal = 0
let isEndRoll = false
let endRollPassed = false
let endRollLines = 0
let preEndRollLines = 0
let levelTimer = 0
let levelTimerLimit = 58000
let lastPieces = 0
let underwaterProgression = 0
let testMode = false
let nonEvents = []
let bpm
const levelUpdate = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    sound.add("levelup")
    game.stack.levelUpAnimation = 0
    if (game.stat.level % 5 === 0) {
      sound.add("levelupmajor")
    } else {
      sound.add("levelupminor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const levelUpdateAce = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    sound.add("levelup")
    game.stack.levelUpAnimation = 0
    if ((game.stat.level - 1) % 5 === 0) {
      sound.add("levelupmajor")
    } else {
      sound.add("levelupminor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const testModeUpdate = () => {
	if (input.getGamePress("testModeKey")) {
		if (testMode !== false) {
			testMode = false
		} else {
			testMode = true
		}
	}
}
const levelUpdateSega = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    if (game.stat.level % 2 === 0 || game.stat.level > 15) {
      sound.add("levelup")
	  sound.add("levelupmajor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const krsLevelSystem = (game, pieceRequirement) => {
	let returnValue = false
	game.stat.level = Math.floor(game.stat.piece / pieceRequirement) + 1
	if (game.stat.level !== lastLevel) {
		sound.add("levelup")
		sound.add("levelupmajor")
		returnValue = true
	}
	lastLevel = game.stat.level
	return returnValue
}
const krsGradingSystem = (
	game, 
	gradingTable = [
		[0, "N/A"],
	],
	firstGrade = "N/A",
) => {
	for (const pair of gradingTable) {
        const score = pair[0]
        const grade = pair[1]
        if (game.stat.score >= score) {
			game.stat.grade = grade
			break
        }
    }
	if (lastGrade !== game.stat.grade && game.stat.grade !== "N/A") {
		if (game.stat.grade !== firstGrade) {
			sound.add("gradeup")
		}
	}
	lastGrade = game.stat.grade
}

export const loops = {
  beginner: {
    update: (arg) => {
	  const game = gameHandler.game
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      krsHardDrop(arg)
	  krsSoftDrop(arg)
      krsLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
        game.playedHurryUp = false
      }
	  testModeUpdate()
      /* Might use this code later
      $('#das').max = arg.piece.dasLimit;
      $('#das').value = arg.piece.das;
      $('#das').style.setProperty('--opacity', ((arg.piece.arr >= arg.piece.arrLimit) || arg.piece.inAre) ? 1 : 0);
      */
    },
    onPieceSpawn: (game) => {
	  const pieceRequirement = 50
	  const levelGoal = 20
      const x = game.stat.level
      const gravityEquation = (0.8 - (x - 1) * 0.007) ** (x - 1)
      if (game.stat.level < 10) {
		  game.piece.gravity = Math.max((gravityEquation * 1000) / Math.max(((game.stat.level - 1) * 10), 1), framesToMs(1 / 20))
	  } else {
		  game.piece.gravity = framesToMs(1 / 20)
	  }
      updateFallSpeed(game)
      if (krsLevelSystem(game, pieceRequirement)) {
		game.timePassedOffset += game.timePassed
		game.timePassed = 0
	  }
	  const timeLimitTable = [
		[1, 100],
		[2, 95],
		[3, 90],
        [4, 85],
        [5, 80],
        [6, 75],
        [7, 70],
        [8, 65],
		[9, 60],
		[10, 55],
		[11, 50],
		[12, 45],
		[13, 40],
	  ]
	  const areTable = [
		[1, 30],
		[2, 28],
		[3, 26],
        [4, 24],
        [5, 20],
        [6, 18],
        [7, 16],
        [8, 14],
		[9, 12],
		[10, 10],
		[11, 8],
		[12, 6],
      ]
	  const areLineModifierTable = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTable = [
		[1, 30],
		[2, 28],
		[3, 26],
        [4, 24],
        [5, 20],
        [6, 18],
        [7, 16],
        [8, 14],
		[9, 12],
		[10, 10],
		[11, 8],
		[12, 6],
      ]
	  const lockDelayTable = [
		[10, 30],
		[11, 28],
		[12, 26],
		[13, 24],
		[14, 22],
		[15, 20],
		[16, 18],
		[17, 16],
		[18, 14],
		[19, 12],
		[20, 10],
      ]
	  const musicProgressionTable = [
        [4.8, 1],
        [5, 2],
        [9.8, 3],
        [10, 4],
		[14.8, 5],
        [15, 6],
		[20.8, 7],
      ]
	  for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.piece >= Math.floor((level - 1) * pieceRequirement) && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
			  break
            case 3:
              sound.killBgm()
              break
			case 5:
			  sound.killBgm()
			  break
			case 7:
			  sound.killBgm()
			  break
            case 2:
			  sound.loadBgm(["krs2"], "krsproofofconcept")
              sound.killBgm()
              sound.playBgm(["krs2"], "krsproofofconcept")
			  break
            case 4:
			  sound.loadBgm(["krs3"], "krsproofofconcept")
              sound.killBgm()
              sound.playBgm(["krs3"], "krsproofofconcept")
			  break
			case 6:
			  sound.loadBgm(["krs4"], "krsproofofconcept")
              sound.killBgm()
              sound.playBgm(["krs4"], "krsproofofconcept")
			  break
          }
          game.musicProgression = entry
        }
      }
	  for (const pair of timeLimitTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level) {
          game.timeGoal = entry * 1000
          break
        }
      }
	  for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  if (game.stat.piece >= pieceRequirement * levelGoal) {
		game.stat.level = levelGoal
		game.stat.piece = pieceRequirement * levelGoal
		$("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
	  }
    },
    onInit: (game) => {
      game.lineGoal = null
      game.stat.level = 1
      lastLevel = 1
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
	  game.isRaceMode = true
	  game.timePassed = 0
	  game.timePassedOffset = 0
	  game.timeGoal = 100000
	  game.musicProgression = 0
    },
  },
}