# Mapa de símbolos (generado por tools/regen-mapa.mjs, no editar)

## src/core/rng.js (12L)
src/core/rng.js:2 +mulberry32
src/core/rng.js:10 +pickFrom
src/core/rng.js:11 +randomSeed
## src/data/bosses.js (36L)
src/data/bosses.js:5 +BOSSES
src/data/bosses.js:35 +BOSS_IDS
## src/data/mates.js (3L)
src/data/mates.js:2 +MATES
## src/data/minigame-catalog.js (53L)
src/data/minigame-catalog.js:28 +MINIGAMES
## src/data/modifiers.js (48L)
src/data/modifiers.js:1 +MODIFIERS
src/data/modifiers.js:44 +nodeModifier
## src/data/mutations.js (52L)
src/data/mutations.js:3 +MUTATIONS
src/data/mutations.js:15 KEYS
src/data/mutations.js:17 +countMutations
src/data/mutations.js:19 +pickMutationChoices
src/data/mutations.js:30 +EXTRA_MOVES
src/data/mutations.js:36 +applyMutations
## src/data/pieces.js (28L)
src/data/pieces.js:5 +PIECES
src/data/pieces.js:20 EXTRA_PATTERNS
src/data/pieces.js:22 +PIECE_TYPES
src/data/pieces.js:23 +PIECE_NAMES
src/data/pieces.js:24 +PIECE_VALUE
src/data/pieces.js:25 +PIECE_RULES
src/data/pieces.js:27 +MOVE_NAMES
## src/data/sfx-samples.js (109L)
src/data/sfx-samples.js:3 +SFX_SAMPLES
## src/data/themes.js (94L)
src/data/themes.js:7 +THEMES
src/data/themes.js:69 PX_IMAGES
src/data/themes.js:70 pixelImages
src/data/themes.js:81 applied
src/data/themes.js:82 +applyTheme
## src/game/achievements.js (95L)
src/game/achievements.js:5 KEY
src/game/achievements.js:6 read
src/game/achievements.js:7 write
src/game/achievements.js:10 +ACHIEVEMENT_GROUPS
src/game/achievements.js:14 +achievementGroups
src/game/achievements.js:21 +ACHIEVEMENTS
src/game/achievements.js:58 STATS_KEY
src/game/achievements.js:59 +loadStats
src/game/achievements.js:60 +bump
src/game/achievements.js:62 +loadAchievements
src/game/achievements.js:63 +saveAchievements
src/game/achievements.js:67 +award
src/game/achievements.js:79 SEEN_KEY
src/game/achievements.js:80 +loadSeen
src/game/achievements.js:81 +seePieces
src/game/achievements.js:89 MUT_KEY
src/game/achievements.js:90 +loadMutSeen
src/game/achievements.js:91 +seeMutations
## src/game/barrier.js (109L)
src/game/barrier.js:2 +N
src/game/barrier.js:4 +DIFFS
src/game/barrier.js:9 DIRS
src/game/barrier.js:11 +newBarrier
src/game/barrier.js:22 blocks
src/game/barrier.js:26 other
src/game/barrier.js:28 inside
src/game/barrier.js:31 +steps
src/game/barrier.js:46 +distance
src/game/barrier.js:62 +canWall
src/game/barrier.js:72 +act
src/game/barrier.js:90 +botAction
## src/game/bodyguard.js (155L)
src/game/bodyguard.js:5 +SIZE
src/game/bodyguard.js:6 +DIFFS
src/game/bodyguard.js:11 ESCORTS
src/game/bodyguard.js:12 key
src/game/bodyguard.js:13 board
src/game/bodyguard.js:14 piece
src/game/bodyguard.js:15 pick
src/game/bodyguard.js:16 kingOf
src/game/bodyguard.js:17 foesOf
src/game/bodyguard.js:19 +legal
src/game/bodyguard.js:22 after
src/game/bodyguard.js:28 +kingAttacked
src/game/bodyguard.js:34 +dangerSquares
src/game/bodyguard.js:41 safeReplies
src/game/bodyguard.js:53 generate
src/game/bodyguard.js:81 +newBodyguard
src/game/bodyguard.js:92 distance
src/game/bodyguard.js:94 score
src/game/bodyguard.js:111 reinforce
src/game/bodyguard.js:119 enemyTurn
src/game/bodyguard.js:138 +move
## src/game/bomber.js (205L)
src/game/bomber.js:3 FUSE
src/game/bomber.js:4 L_JUMP
src/game/bomber.js:5 DIAG
src/game/bomber.js:6 DIRS
src/game/bomber.js:13 +FOES
src/game/bomber.js:20 +DIFFS
src/game/bomber.js:26 dist
src/game/bomber.js:28 +newBomber
src/game/bomber.js:56 inside
src/game/bomber.js:57 free
src/game/bomber.js:58 +doorOpen
src/game/bomber.js:62 rays
src/game/bomber.js:76 +blastOf
src/game/bomber.js:78 explode
src/game/bomber.js:94 huntStep
src/game/bomber.js:113 wander
src/game/bomber.js:123 leap
src/game/bomber.js:133 inSight
src/game/bomber.js:142 moveFoe
src/game/bomber.js:169 +step
## src/game/bowling.js (107L)
src/game/bowling.js:4 +LAUNCH_COLS
src/game/bowling.js:7 +DIFFS
src/game/bowling.js:14 +HP
src/game/bowling.js:16 MIX
src/game/bowling.js:17 pickType
src/game/bowling.js:24 down
src/game/bowling.js:26 pickLane
src/game/bowling.js:31 token
src/game/bowling.js:33 +newBowling
src/game/bowling.js:41 +canLaunch
src/game/bowling.js:43 +launch
src/game/bowling.js:49 +tick
## src/game/cards.js (124L)
src/game/cards.js:8 behind
src/game/cards.js:9 occupiedBy
src/game/cards.js:10 freeTile
src/game/cards.js:12 growDir
src/game/cards.js:14 +CARDS
src/game/cards.js:71 +CARD_IDS
src/game/cards.js:72 +HAND_LIMIT
src/game/cards.js:73 +STARTER_CARDS
src/game/cards.js:75 +pickCardChoices
src/game/cards.js:84 +cardTargets
src/game/cards.js:96 +previewMoves
src/game/cards.js:108 +playCard
## src/game/checkers.js (101L)
src/game/checkers.js:4 +DIFFS
src/game/checkers.js:9 DIAG
src/game/checkers.js:10 fwd
src/game/checkers.js:12 +newCheckers
src/game/checkers.js:23 +pieceAt
src/game/checkers.js:24 inside
src/game/checkers.js:25 dirsOf
src/game/checkers.js:27 movesOf
src/game/checkers.js:41 +legal
src/game/checkers.js:49 +play
src/game/checkers.js:67 clone
src/game/checkers.js:71 score
src/game/checkers.js:73 search
src/game/checkers.js:88 +botMove
## src/game/collapsing-floor.js (38L)
src/game/collapsing-floor.js:2 +SIZE
src/game/collapsing-floor.js:3 +DIFFS
src/game/collapsing-floor.js:8 key
src/game/collapsing-floor.js:10 safeRoute
src/game/collapsing-floor.js:11 randIndex
src/game/collapsing-floor.js:12 +newCollapsingFloor
src/game/collapsing-floor.js:16 +legal
src/game/collapsing-floor.js:17 +move
## src/game/connect4.js (109L)
src/game/connect4.js:2 +ROWS
src/game/connect4.js:4 +emptyGrid
src/game/connect4.js:7 +dropRow
src/game/connect4.js:13 +lineAt
src/game/connect4.js:25 +isFull
src/game/connect4.js:31 ORDER
src/game/connect4.js:32 DEPTH
src/game/connect4.js:34 +DIFFS
src/game/connect4.js:39 WIN
src/game/connect4.js:42 WINDOWS
src/game/connect4.js:55 weight
src/game/connect4.js:57 evaluate
src/game/connect4.js:70 search
src/game/connect4.js:91 +botColumn
## src/game/difficulty.js (115L)
src/game/difficulty.js:8 +floorTier
src/game/difficulty.js:12 BAND
src/game/difficulty.js:13 +bandOf
src/game/difficulty.js:18 +RIVALS
src/game/difficulty.js:32 +RIVAL_STEPS
src/game/difficulty.js:33 TIER_STEP
src/game/difficulty.js:37 +DIFFICULTIES
src/game/difficulty.js:45 +rivalForFloor
src/game/difficulty.js:53 weightsOf
src/game/difficulty.js:54 +MOD_WEIGHTS
src/game/difficulty.js:55 +MINI_WEIGHTS
src/game/difficulty.js:56 +isMiniModifier
src/game/difficulty.js:58 draw
src/game/difficulty.js:69 +FAV_WEIGHT
src/game/difficulty.js:70 +pickModifier
src/game/difficulty.js:85 +miniBossFloors
src/game/difficulty.js:102 +MINI_BOSSES
src/game/difficulty.js:103 +FINAL_BOSSES
src/game/difficulty.js:108 +RARE_TYPES
src/game/difficulty.js:109 +ARMY_STEPS
src/game/difficulty.js:114 +armyForFloor
## src/game/dimensional-contraband.js (27L)
src/game/dimensional-contraband.js:2 +SIZE
src/game/dimensional-contraband.js:3 +DIFFS
src/game/dimensional-contraband.js:8 key
src/game/dimensional-contraband.js:9 +newContraband
src/game/dimensional-contraband.js:14 +legal
src/game/dimensional-contraband.js:15 +move
## src/game/duel.js (97L)
src/game/duel.js:5 +BEATS
src/game/duel.js:6 +TYPE_NAME
src/game/duel.js:10 +MOVES
src/game/duel.js:27 +FIGHTERS
src/game/duel.js:39 +DIFFS
src/game/duel.js:45 unit
src/game/duel.js:47 +newDuel
src/game/duel.js:52 +active
src/game/duel.js:53 +effect
src/game/duel.js:56 strike
src/game/duel.js:75 foeChoice
src/game/duel.js:85 +turn
## src/game/escape.js (32L)
src/game/escape.js:3 +SIZE
src/game/escape.js:4 +DIFFS
src/game/escape.js:9 board
src/game/escape.js:10 piece
src/game/escape.js:11 +newEscape
src/game/escape.js:15 +legal
src/game/escape.js:16 +move
## src/game/fusion.js (70L)
src/game/fusion.js:4 +LADDER
src/game/fusion.js:6 +DIFFS
src/game/fusion.js:11 DIRS
src/game/fusion.js:13 +newFusion
src/game/fusion.js:20 at
src/game/fusion.js:22 spawn
src/game/fusion.js:34 +slide
src/game/fusion.js:65 canMove
## src/game/generate.js (379L)
src/game/generate.js:8 +generateMap
src/game/generate.js:78 LESSONS
src/game/generate.js:84 +tutorialMap
src/game/generate.js:93 SHAPES
src/game/generate.js:95 +generateBoard
src/game/generate.js:148 addTerrain
src/game/generate.js:170 BACK_RANK
src/game/generate.js:177 SECOND_RANK
src/game/generate.js:184 pawnRank
src/game/generate.js:185 centered
src/game/generate.js:189 FORMATIONS
src/game/generate.js:196 FORMATION_POOL
src/game/generate.js:200 DEPLOYS
src/game/generate.js:206 DEPLOY_POOL
src/game/generate.js:207 spread
src/game/generate.js:214 nextId
src/game/generate.js:215 +makePiece
src/game/generate.js:223 +eliteVariants
src/game/generate.js:229 protectElites
src/game/generate.js:244 ensureRare
src/game/generate.js:256 +placePieces
src/game/generate.js:267 placeOnce
src/game/generate.js:361 +placeBoss
## src/game/giant-hunt.js (151L)
src/game/giant-hunt.js:6 +SIZE
src/game/giant-hunt.js:7 +DIFFS
src/game/giant-hunt.js:12 key
src/game/giant-hunt.js:13 board
src/game/giant-hunt.js:14 pick
src/game/giant-hunt.js:15 giantOf
src/game/giant-hunt.js:16 hunterOf
src/game/giant-hunt.js:17 covers
src/game/giant-hunt.js:19 +newGiantHunt
src/game/giant-hunt.js:39 +legal
src/game/giant-hunt.js:41 footprintDistance
src/game/giant-hunt.js:45 chargeDir
src/game/giant-hunt.js:52 +chargePath
src/game/giant-hunt.js:67 charge
src/game/giant-hunt.js:85 step
src/game/giant-hunt.js:107 +enraged
src/game/giant-hunt.js:109 +move
src/game/giant-hunt.js:142 +threatCells
## src/game/hockey.js (220L)
src/game/hockey.js:3 +CELL
src/game/hockey.js:4 +W
src/game/hockey.js:5 +PUCK_R
src/game/hockey.js:6 +GOAL
src/game/hockey.js:7 +GOALS
src/game/hockey.js:8 +PUCK_MAX
src/game/hockey.js:9 +PLAYER_MAX
src/game/hockey.js:10 FRICTION
src/game/hockey.js:11 WALL_E
src/game/hockey.js:12 SERVE_PAUSE
src/game/hockey.js:13 STALL_T
src/game/hockey.js:14 +HOLD_T
src/game/hockey.js:15 DT
src/game/hockey.js:20 +DIFFS
src/game/hockey.js:26 clamp
src/game/hockey.js:28 limits
src/game/hockey.js:31 mallet
src/game/hockey.js:33 +newHockey
src/game/hockey.js:41 serve
src/game/hockey.js:50 +aim
src/game/hockey.js:56 drive
src/game/hockey.js:67 +predictX
src/game/hockey.js:76 +think
src/game/hockey.js:118 bounceMallet
src/game/hockey.js:138 capSpeed
src/game/hockey.js:144 walls
src/game/hockey.js:165 wall
src/game/hockey.js:169 +step
src/game/hockey.js:177 sub
## src/game/hunt.js (133L)
src/game/hunt.js:6 +SIZE
src/game/hunt.js:7 +DIFFS
src/game/hunt.js:12 key
src/game/hunt.js:13 makeBoard
src/game/hunt.js:14 make
src/game/hunt.js:15 pick
src/game/hunt.js:16 hunterOf
src/game/hunt.js:17 runnerOf
src/game/hunt.js:18 clone
src/game/hunt.js:21 crownIn
src/game/hunt.js:28 +legal
src/game/hunt.js:32 advanceRunner
src/game/hunt.js:47 +move
src/game/hunt.js:65 solve
src/game/hunt.js:82 winningFirstMoves
src/game/hunt.js:91 candidate
src/game/hunt.js:112 +newHunt
src/game/hunt.js:132 +_solve
## src/game/izombie.js (101L)
src/game/izombie.js:6 +ROWS
src/game/izombie.js:9 +DIFFS
src/game/izombie.js:14 +COST
src/game/izombie.js:16 DEFENSES
src/game/izombie.js:24 +LOOT
src/game/izombie.js:26 +newZombie
src/game/izombie.js:38 +danger
src/game/izombie.js:49 +at
src/game/izombie.js:50 +canBuy
src/game/izombie.js:52 +buy
src/game/izombie.js:61 +advance
## src/game/king-impostor.js (94L)
src/game/king-impostor.js:6 +SIZE
src/game/king-impostor.js:7 +DIFFS
src/game/king-impostor.js:13 +NAMES
src/game/king-impostor.js:14 key
src/game/king-impostor.js:15 board
src/game/king-impostor.js:18 +reach
src/game/king-impostor.js:28 build
src/game/king-impostor.js:41 clues
src/game/king-impostor.js:66 +newKingImpostor
src/game/king-impostor.js:82 +activeClues
src/game/king-impostor.js:84 +choose
## src/game/knight.js (47L)
src/game/knight.js:3 +SIZE
src/game/knight.js:5 +DIFFS
src/game/knight.js:10 JUMPS
src/game/knight.js:11 k
src/game/knight.js:13 +newRoute
src/game/knight.js:32 +jumps
src/game/knight.js:35 +isTarget
src/game/knight.js:36 +isVisited
src/game/knight.js:37 +remaining
src/game/knight.js:39 +jump
## src/game/laboratory.js (25L)
src/game/laboratory.js:3 +SIZE
src/game/laboratory.js:4 +DIFFS
src/game/laboratory.js:9 key
src/game/laboratory.js:10 +newLaboratory
src/game/laboratory.js:16 +legal
src/game/laboratory.js:17 +move
## src/game/laststand.js (64L)
src/game/laststand.js:8 +DIFFS
src/game/laststand.js:13 +PRICES
src/game/laststand.js:14 WAVE
src/game/laststand.js:16 +newStand
src/game/laststand.js:25 +building
src/game/laststand.js:26 +canPlace
src/game/laststand.js:29 +nextWave
src/game/laststand.js:41 +place
src/game/laststand.js:49 +step
## src/game/marcianos.js (125L)
src/game/marcianos.js:3 SHOT_STEP
src/game/marcianos.js:4 MAX_SHOTS
src/game/marcianos.js:8 +WAVES
src/game/marcianos.js:17 FIRE
src/game/marcianos.js:20 +DIFFS
src/game/marcianos.js:26 +newMarcianos
src/game/marcianos.js:34 spawnWave
src/game/marcianos.js:53 climb
src/game/marcianos.js:62 descend
src/game/marcianos.js:88 fall
src/game/marcianos.js:101 +step
## src/game/match.js (258L)
src/game/match.js:9 +QUIET_LIMIT
src/game/match.js:11 +Match
src/game/match.js:217 cheapestAttacker
src/game/match.js:231 +botChooseMove
## src/game/mates.js (61L)
src/game/mates.js:6 +SIZE
src/game/mates.js:7 +board
src/game/mates.js:10 +DIFFS
src/game/mates.js:16 +fromSpec
src/game/mates.js:18 +play
src/game/mates.js:24 +moves
src/game/mates.js:27 kingDead
src/game/mates.js:28 kingCaps
src/game/mates.js:29 +capturesKing
src/game/mates.js:32 +captureMove
src/game/mates.js:39 +mateKeys
src/game/mates.js:51 +solve
src/game/mates.js:54 +defend
## src/game/minefield.js (104L)
src/game/minefield.js:5 +SIZE
src/game/minefield.js:6 +DIFFS
src/game/minefield.js:11 board
src/game/minefield.js:12 key
src/game/minefield.js:13 inside
src/game/minefield.js:14 JUMPS
src/game/minefield.js:15 AREA
src/game/minefield.js:18 route
src/game/minefield.js:36 +newMinefield
src/game/minefield.js:51 +nearbyMines
src/game/minefield.js:58 uncover
src/game/minefield.js:67 +legal
src/game/minefield.js:69 +move
src/game/minefield.js:94 +probe
## src/game/queens.js (27L)
src/game/queens.js:3 +DIFFS
src/game/queens.js:9 attacks
src/game/queens.js:11 +newQueens
src/game/queens.js:16 +clashing
src/game/queens.js:18 +toggle
## src/game/rules.js (201L)
src/game/rules.js:6 +key
src/game/rules.js:7 +sizeOf
src/game/rules.js:9 +cellsOf
src/game/rules.js:16 +buildOccupancy
src/game/rules.js:22 +ctxOf
src/game/rules.js:23 inBounds
src/game/rules.js:24 +walkable
src/game/rules.js:29 +immune
src/game/rules.js:36 +landing
src/game/rules.js:49 free
src/game/rules.js:58 pathClear
src/game/rules.js:68 forward
src/game/rules.js:70 canMoveAs
src/game/rules.js:121 +moveTypesOf
src/game/rules.js:125 canMove
src/game/rules.js:129 +pieceCanMove
src/game/rules.js:133 +legalMoves
src/game/rules.js:142 +hasAnyLegalMove
src/game/rules.js:148 +threatenedPieces
src/game/rules.js:160 +moveCells
src/game/rules.js:168 +anchorForCell
src/game/rules.js:184 +reachPreview
## src/game/run.js (76L)
src/game/run.js:7 RUN_KEY
src/game/run.js:8 SETTINGS_KEY
src/game/run.js:10 read
src/game/run.js:11 write
src/game/run.js:13 +loadRun
src/game/run.js:14 +saveRun
src/game/run.js:15 +clearRun
src/game/run.js:17 +createRun
src/game/run.js:26 +PREF_LIMITS
src/game/run.js:27 +withPrefs
src/game/run.js:29 +completeNode
src/game/run.js:38 +isAvailable
src/game/run.js:49 MINIS_KEY
src/game/run.js:50 +loadUnlocked
src/game/run.js:51 +unlockMini
src/game/run.js:54 BOSSES_KEY
src/game/run.js:55 +loadBosses
src/game/run.js:56 +unlockBoss
src/game/run.js:58 +DEFAULT_SETTINGS
src/game/run.js:60 +loadSettings
src/game/run.js:64 +saveSettings
src/game/run.js:68 DEMO_KEY
src/game/run.js:69 +takeNewDemos
## src/game/shop.js (81L)
src/game/shop.js:6 KEY
src/game/shop.js:7 read
src/game/shop.js:8 write
src/game/shop.js:11 +COINS_PER_FLOWER
src/game/shop.js:12 +CARD_PRICE
src/game/shop.js:14 +SEED_PRICE
src/game/shop.js:16 +COINS_PER_NODE
src/game/shop.js:18 +THEME_SHOP
src/game/shop.js:19 +PENDING_LIMIT
src/game/shop.js:21 +loadShop
src/game/shop.js:29 +saveShop
src/game/shop.js:31 +addCoins
src/game/shop.js:38 +charge
src/game/shop.js:40 +themeOwned
src/game/shop.js:41 +grantTheme
src/game/shop.js:50 +addPending
src/game/shop.js:56 +takePending
src/game/shop.js:65 +addToHand
src/game/shop.js:76 +consumeCard
src/game/shop.js:80 +isShopCard
## src/game/zen.js (128L)
src/game/zen.js:4 KEY
src/game/zen.js:5 read
src/game/zen.js:6 write
src/game/zen.js:8 +ZEN_KINDS
src/game/zen.js:9 +ZEN_NAMES
src/game/zen.js:10 +ZEN_BASE
src/game/zen.js:11 +ZEN_MAX
src/game/zen.js:14 BUD_MS
src/game/zen.js:15 BLOOM_MS
src/game/zen.js:18 +BASE_GRID
src/game/zen.js:25 +BASE_KEYS
src/game/zen.js:27 +cellKey
src/game/zen.js:29 +expandCost
src/game/zen.js:32 +blankZen
src/game/zen.js:36 seedsOf
src/game/zen.js:38 +loadZen
src/game/zen.js:49 +saveZen
src/game/zen.js:52 +zenStage
src/game/zen.js:61 +zenSow
src/game/zen.js:72 +zenWater
src/game/zen.js:81 +zenDig
src/game/zen.js:86 +zenHarvest
src/game/zen.js:93 +zenExpand
src/game/zen.js:100 +LEAF_MS
src/game/zen.js:101 +LEAF_MAX
src/game/zen.js:102 +LEAF_COINS
src/game/zen.js:103 +zenLeaves
src/game/zen.js:112 +zenSweep
src/game/zen.js:115 +BUTTERFLY_MS
src/game/zen.js:116 +butterflyGift
src/game/zen.js:121 +addZenSeeds
src/game/zen.js:127 +pickSeed
## src/lab-catalog.js (79L)
src/lab-catalog.js:2 FALLBACK_THEMES
src/lab-catalog.js:10 THEMES
src/lab-catalog.js:20 BOARD_VARIANTS
src/lab-catalog.js:32 MINIS
src/lab-catalog.js:38 themeSelect
src/lab-catalog.js:39 miniSelect
src/lab-catalog.js:40 difficulty
src/lab-catalog.js:41 frame
src/lab-catalog.js:43 fillSelect
src/lab-catalog.js:61 updatePreview
## src/lab.js (114L)
src/lab.js:10 board
src/lab.js:14 MOMENTS
src/lab.js:29 SCENES
src/lab.js:77 run
src/lab.js:93 stage
src/lab.js:94 moments
src/lab.js:95 play
src/lab.js:100 scenes
src/lab.js:106 cams
## src/main.js (5L)
## src/ui/app.js (301L)
src/ui/app.js:50 REST_CARDS
src/ui/app.js:55 BAG_CARDS
src/ui/app.js:62 shuffle3
src/ui/app.js:64 MINI_PRIZES
src/ui/app.js:65 MINI_SCREENS
src/ui/app.js:66 ONE_SHOT
src/ui/app.js:68 +App
src/ui/app.js:273 AchievementToast
## src/ui/components.js (194L)
src/ui/components.js:9 +ThemeLook
src/ui/components.js:17 +Topbar
src/ui/components.js:30 +MiniEnd
src/ui/components.js:42 +MiniDiff
src/ui/components.js:58 +MiniTools
src/ui/components.js:83 +ConfirmButton
src/ui/components.js:94 +BossCard
src/ui/components.js:107 +useEnter
src/ui/components.js:115 Card
src/ui/components.js:132 KIND_LABEL
src/ui/components.js:133 +RARITY_LABEL
src/ui/components.js:137 +CardFace
src/ui/components.js:151 +CardPick
src/ui/components.js:177 +TurnBanner
src/ui/components.js:188 +Toggle
## src/ui/demos.js (30L)
src/ui/demos.js:9 +pieceDemo
src/ui/demos.js:14 +mutationDemo
src/ui/demos.js:23 +bossDemo
src/ui/demos.js:29 +playDemo
## src/ui/fullscreen.js (23L)
src/ui/fullscreen.js:5 +canFullscreen
src/ui/fullscreen.js:6 isFull
src/ui/fullscreen.js:8 +setFullscreen
src/ui/fullscreen.js:14 +useFullscreen
## src/ui/hop.js (193L)
src/ui/hop.js:9 OUT
src/ui/hop.js:10 +reduced
src/ui/hop.js:11 speed
src/ui/hop.js:12 gooCount
src/ui/hop.js:15 gooOf
src/ui/hop.js:30 liquid
src/ui/hop.js:82 +hopPiece
src/ui/hop.js:122 +hopLater
src/ui/hop.js:133 +captureHop
src/ui/hop.js:153 +snapPieces
src/ui/hop.js:157 +pieceDiffs
src/ui/hop.js:172 +popPiece
src/ui/hop.js:180 +fallPiece
## src/ui/icons.js (105L)
src/ui/icons.js:8 CUT
src/ui/icons.js:9 cut
src/ui/icons.js:10 dot
src/ui/icons.js:13 f3
src/ui/icons.js:14 bar
src/ui/icons.js:19 rot
src/ui/icons.js:21 P
src/ui/icons.js:87 OFFSET
src/ui/icons.js:94 +Icon
src/ui/icons.js:102 +PieceIcon
## src/ui/lib.js (8L)
src/ui/lib.js:4 +html
## src/ui/moments.js (262L)
src/ui/moments.js:11 OUT
src/ui/moments.js:12 IN
src/ui/moments.js:13 reduced
src/ui/moments.js:14 sleep
src/ui/moments.js:16 skippable
src/ui/moments.js:24 color
src/ui/moments.js:26 +Moments
## src/ui/screens/achievements.js (47L)
src/ui/screens/achievements.js:8 Bar
src/ui/screens/achievements.js:11 +AchievementsScreen
## src/ui/screens/barrier.js (130L)
src/ui/screens/barrier.js:9 KEYS
src/ui/screens/barrier.js:10 anchor
src/ui/screens/barrier.js:12 +BarrierScreen
## src/ui/screens/bodyguard.js (78L)
src/ui/screens/bodyguard.js:8 NAMES
src/ui/screens/bodyguard.js:9 pcAt
src/ui/screens/bodyguard.js:11 +BodyguardScreen
## src/ui/screens/bomber.js (131L)
src/ui/screens/bomber.js:11 KEYS
src/ui/screens/bomber.js:12 PAD
src/ui/screens/bomber.js:14 +BomberScreen
## src/ui/screens/bowling.js (199L)
src/ui/screens/bowling.js:10 TICK_MS
src/ui/screens/bowling.js:11 css
src/ui/screens/bowling.js:13 +BowlingScreen
## src/ui/screens/caceria.js (65L)
src/ui/screens/caceria.js:8 pcAt
src/ui/screens/caceria.js:10 +CaceriaScreen
## src/ui/screens/checkers.js (108L)
src/ui/screens/checkers.js:9 wait
src/ui/screens/checkers.js:11 +CheckersScreen
## src/ui/screens/collapsing-floor.js (19L)
src/ui/screens/collapsing-floor.js:7 +CollapsingFloorScreen
## src/ui/screens/connect4.js (88L)
src/ui/screens/connect4.js:8 wait
src/ui/screens/connect4.js:10 +Connect4Screen
## src/ui/screens/contraband.js (55L)
src/ui/screens/contraband.js:9 +ContrabandScreen
## src/ui/screens/duel.js (116L)
src/ui/screens/duel.js:11 wait
src/ui/screens/duel.js:12 OUT
src/ui/screens/duel.js:14 Plate
src/ui/screens/duel.js:25 +DuelScreen
## src/ui/screens/escape.js (46L)
src/ui/screens/escape.js:8 +EscapeScreen
## src/ui/screens/fusion.js (67L)
src/ui/screens/fusion.js:10 KEYS
src/ui/screens/fusion.js:11 PAD
src/ui/screens/fusion.js:13 +FusionScreen
## src/ui/screens/gallery.js (120L)
src/ui/screens/gallery.js:19 SOON
src/ui/screens/gallery.js:25 ThemeGroup
src/ui/screens/gallery.js:40 RULE
src/ui/screens/gallery.js:41 Locked
src/ui/screens/gallery.js:43 +GalleryScreen
## src/ui/screens/game.js (643L)
src/ui/screens/game.js:24 SIDE_NAME
src/ui/screens/game.js:27 pieceName
src/ui/screens/game.js:29 TIPS
src/ui/screens/game.js:38 cardEffect
src/ui/screens/game.js:49 +GameScreen
src/ui/screens/game.js:614 EndOverlay
## src/ui/screens/giant-hunt.js (139L)
src/ui/screens/giant-hunt.js:11 MOVE_NAMES
src/ui/screens/giant-hunt.js:12 pcAt
src/ui/screens/giant-hunt.js:15 GiantBody
src/ui/screens/giant-hunt.js:24 +GiantHuntScreen
## src/ui/screens/hockey.js (197L)
src/ui/screens/hockey.js:10 KEYS
src/ui/screens/hockey.js:11 css
src/ui/screens/hockey.js:13 +HockeyScreen
## src/ui/screens/izombie.js (86L)
src/ui/screens/izombie.js:9 +IZombieScreen
## src/ui/screens/king-impostor.js (80L)
src/ui/screens/king-impostor.js:10 COLS
src/ui/screens/king-impostor.js:11 squareName
src/ui/screens/king-impostor.js:13 +KingImpostorScreen
## src/ui/screens/knight.js (57L)
src/ui/screens/knight.js:8 +KnightScreen
## src/ui/screens/laboratory.js (21L)
src/ui/screens/laboratory.js:8 +LaboratoryScreen
## src/ui/screens/laststand.js (92L)
src/ui/screens/laststand.js:9 +LastStandScreen
## src/ui/screens/map.js (69L)
src/ui/screens/map.js:9 ROW
src/ui/screens/map.js:11 +MapScreen
## src/ui/screens/marcianos.js (115L)
src/ui/screens/marcianos.js:10 KEYS
src/ui/screens/marcianos.js:11 WAIT
src/ui/screens/marcianos.js:13 +MarcianosScreen
## src/ui/screens/mates.js (113L)
src/ui/screens/mates.js:9 pickOne
src/ui/screens/mates.js:11 load
src/ui/screens/mates.js:16 +MatesScreen
## src/ui/screens/menu.js (112L)
src/ui/screens/menu.js:10 Diorama
src/ui/screens/menu.js:78 +MenuScreen
## src/ui/screens/minefield.js (102L)
src/ui/screens/minefield.js:10 cellAt
src/ui/screens/minefield.js:12 +MinefieldScreen
## src/ui/screens/mini-grid.js (23L)
src/ui/screens/mini-grid.js:6 +MiniGrid
## src/ui/screens/minis.js (20L)
src/ui/screens/minis.js:7 +MinisScreen
## src/ui/screens/overlays.js (70L)
src/ui/screens/overlays.js:11 closeOnBackdrop
src/ui/screens/overlays.js:12 useEscape
src/ui/screens/overlays.js:18 +PauseOverlay
src/ui/screens/overlays.js:48 +HowToOverlay
## src/ui/screens/queens.js (58L)
src/ui/screens/queens.js:7 +QueensScreen
## src/ui/screens/setup.js (145L)
src/ui/screens/setup.js:13 SIDES
src/ui/screens/setup.js:20 RUN_MECHANICS
src/ui/screens/setup.js:21 PrefsCard
src/ui/screens/setup.js:41 +SetupScreen
src/ui/screens/setup.js:95 +SettingsScreen
## src/ui/screens/shop.js (116L)
src/ui/screens/shop.js:13 CARD_LIST
src/ui/screens/shop.js:15 +ShopScreen
## src/ui/screens/zen.js (514L)
src/ui/screens/zen.js:15 ETAPAS
src/ui/screens/zen.js:17 TOOLS
src/ui/screens/zen.js:24 TOOL_ART
src/ui/screens/zen.js:25 reduced
src/ui/screens/zen.js:26 later
src/ui/screens/zen.js:28 the
src/ui/screens/zen.js:29 cap
src/ui/screens/zen.js:31 ROOM
src/ui/screens/zen.js:32 SOIL_COLORS
src/ui/screens/zen.js:33 OUT
src/ui/screens/zen.js:37 potArt
src/ui/screens/zen.js:46 +ZenScreen
## src/ui/sfx.js (357L)
src/ui/sfx.js:7 +SFX_VOLUMES
src/ui/sfx.js:14 JITTER
src/ui/sfx.js:15 RECIPES
src/ui/sfx.js:184 +SFX_NAMES
src/ui/sfx.js:186 enabled
src/ui/sfx.js:187 level
src/ui/sfx.js:188 ctx
src/ui/sfx.js:189 master
src/ui/sfx.js:190 ambient
src/ui/sfx.js:191 noiseBuf
src/ui/sfx.js:193 ensureCtx
src/ui/sfx.js:207 noiseBuffer
src/ui/sfx.js:216 playLayer
src/ui/sfx.js:246 +setSfxEnabled
src/ui/sfx.js:251 +setSfxVolume
src/ui/sfx.js:258 +playSfx
src/ui/sfx.js:274 last
src/ui/sfx.js:279 SAMPLE_GAIN
src/ui/sfx.js:285 buffers
src/ui/sfx.js:286 loadSamples
src/ui/sfx.js:294 playSample
src/ui/sfx.js:307 +MUSIC_TRACKS
src/ui/sfx.js:308 MUSIC_GAIN
src/ui/sfx.js:309 tracks
src/ui/sfx.js:310 scene
src/ui/sfx.js:311 track
src/ui/sfx.js:316 +setMusicScene
src/ui/sfx.js:321 +startAmbient
src/ui/sfx.js:342 +stopAmbient
src/ui/sfx.js:354 +sfxState
## src/ui/zen-art.js (222L)
src/ui/zen-art.js:7 +HEAD
src/ui/zen-art.js:13 +chipArt
src/ui/zen-art.js:15 f
src/ui/zen-art.js:18 +px
src/ui/zen-art.js:19 BASE
src/ui/zen-art.js:23 +POT
src/ui/zen-art.js:28 +SOIL
src/ui/zen-art.js:31 sprig
src/ui/zen-art.js:45 ROMERO_TIPS
src/ui/zen-art.js:48 leaf
src/ui/zen-art.js:49 SALVIA_ROSETTE
src/ui/zen-art.js:50 WHORLS
src/ui/zen-art.js:51 salviaSpike
src/ui/zen-art.js:63 LAV_STEMS
src/ui/zen-art.js:64 lavLeaves
src/ui/zen-art.js:66 lavStem
src/ui/zen-art.js:73 +plantArt
src/ui/zen-art.js:88 shore
src/ui/zen-art.js:89 loop
src/ui/zen-art.js:93 STONES
src/ui/zen-art.js:97 KOI
src/ui/zen-art.js:99 +orbit
src/ui/zen-art.js:100 +KOI_ORBITS
src/ui/zen-art.js:101 +pondArt
src/ui/zen-art.js:128 +MOSS
src/ui/zen-art.js:137 +STEP
src/ui/zen-art.js:144 +LANTERN
src/ui/zen-art.js:160 MAPLE
src/ui/zen-art.js:161 VEINS
src/ui/zen-art.js:162 maple
src/ui/zen-art.js:163 +mapleLeaf
src/ui/zen-art.js:164 +BRANCH
src/ui/zen-art.js:172 +BUTTERFLY
src/ui/zen-art.js:180 +CAN
src/ui/zen-art.js:188 +SHEARS
src/ui/zen-art.js:194 +SHOVEL
src/ui/zen-art.js:199 +POUCH
src/ui/zen-art.js:207 +rakeArt
## src/view/board-view.js (896L)
src/view/board-view.js:10 +CAMERAS
src/view/board-view.js:11 JUMPERS
src/view/board-view.js:12 reduced
src/view/board-view.js:13 gooCount
src/view/board-view.js:14 wait
src/view/board-view.js:15 css
src/view/board-view.js:16 BADGES
src/view/board-view.js:23 +BoardView
## src/view/fx.js (140L)
src/view/fx.js:6 +Fx
## src/view/piece-art.js (128L)
src/view/piece-art.js:10 F
src/view/piece-art.js:11 STROKE
src/view/piece-art.js:13 PLINTH
src/view/piece-art.js:14 PLINTH_TOP
src/view/piece-art.js:15 CX
src/view/piece-art.js:18 BOSS_PLINTH
src/view/piece-art.js:19 isBoss
src/view/piece-art.js:24 LADDER
src/view/piece-art.js:38 boxes
src/view/piece-art.js:39 measure
src/view/piece-art.js:64 layout
src/view/piece-art.js:72 cache
src/view/piece-art.js:73 art
src/view/piece-art.js:86 PX
src/view/piece-art.js:87 PX_BOTTOM
src/view/piece-art.js:88 pixelMode
src/view/piece-art.js:90 pixelArt
src/view/piece-art.js:102 pick
src/view/piece-art.js:108 +pieceSVG
src/view/piece-art.js:122 +headTop
src/view/piece-art.js:124 +RAW_BODIES
src/view/piece-art.js:127 +artOf
## css/base.css (162L)
css/base.css:1 /* Reset, typography, browser surfaces and shared components.
css/base.css:22 /* Icon() pinta las dos versiones; cada mesa muestra la suya (p
css/base.css:30 /* Buttons are printed tokens: the solid bottom edge is the tok
css/base.css:60 /* Teléfonos de 360 px: título en una línea al lado del Volver 
css/base.css:69 /* Paper panels: the rulebook and score sheets of the box.
css/base.css:84 /* Reward cards: actual playing cards of the game, so the card 
css/base.css:95 /* Frame colour says the kind: vermilion = tactic (played in a 
css/base.css:105 /* Cartas de antes de la partida (Organizar): marco azul pizarr
css/base.css:114 /* Gema de rareza: común hueca, rara roja, épica de latón. La u
css/base.css:121 /* Rareza con canal propio, independiente del color del tipo (e
css/base.css:126 /* Rara: el título es una banda de plata pulida. Épica: latón c
css/base.css:137 /* Every figure on a card is paper with an ink outline, so stam
css/base.css:148 /* Card back carries the pawn emblem: the box's identity mark.
## css/board.css (242L)
css/board.css:1 /* 3D tabletop: tilted board plane, tiles with thickness, cardb
css/board.css:26 /* Liquid base while a piece moves: drawn on the board plane ju
css/board.css:33 /* Tiles
css/board.css:49 /* Front face: the board is a slab of thick card, so exposed ed
css/board.css:70 /* Card targeting: dashed brass outline on valid targets; previ
css/board.css:78 /* Terrain: ice is a pale frozen slab with cracks; portals are 
css/board.css:88 /* Pieces
css/board.css:92 /* Zombis de los minijuegos tipo PvZ: verde podrido, distinto d
css/board.css:94 /* Peón zombi de la Plaga: figura verde podrida, base del color
css/board.css:98 /* Posición de casillas y piezas: no se heredan. Heredadas, mov
css/board.css:115 /* Token base: three stacked discs give the coin its thickness;
css/board.css:127 /* Aiming a card: pieces it can be played on wear a dashed bras
css/board.css:146 /* En el set píxel las piezas botan un píxel justo, a saltos y 
css/board.css:149 /* El sprite ya trae contorno y la peana su sombra: sin drop-sh
css/board.css:152 /* Mientras caen las piezas al empezar, quietas: el bote de 32 
css/board.css:155 /* En el set píxel la peana también es de píxeles: disco escalo
css/board.css:167 /* Fog: an enemy far from your pieces is only a shape in the mi
css/board.css:180 /* Piece badges: lock = escorted, flag = falls last, star = bor
css/board.css:205 /* Etiqueta de casilla: ficha de papel con pico, encima de la c
css/board.css:220 /* Mesa Pixelada: el set de pxl. El PNG ya trae color y contorn
css/board.css:226 /* Fondos del tema píxel (art/temas/<tema>, variables puestas p
## css/pixel.css (79L)
css/pixel.css:1 /* Modo píxel: con un tema píxel (data-art="pixel", ver src/dat
css/pixel.css:6 /* Jersey 10 (OFL), servida desde el juego: el subconjunto lati
css/pixel.css:21 /* Solo elementos: con ::before y ::after el navegador calculab
css/pixel.css:25 /* Los dibujos vectoriales (iconos, jardín, minijuegos) sin sua
css/pixel.css:29 /* Marcos del tema: el borde es la imagen cortada en nueve (esq
css/pixel.css:36 /* Botón de 8 bits: el marco tiene las esquinas en escalera y t
css/pixel.css:52 /* Tableros de los minijuegos: las mismas losas del tema que el
css/pixel.css:58 /* Casillas caídas y escombros: la losa del tema las tapaba. Po
css/pixel.css:70 /* Jardín Zen: cada dibujo trae su sprite (zen-art.js) y aquí s
## css/screens.css (1419L)
css/screens.css:1 /* Screen layouts: menu, map, setup/settings, rewards, game HUD
css/screens.css:3 /* Curtain wipe between screens: the one authored transition of
css/screens.css:12 /* Menu: asymmetric, the diorama is the focal point and the tit
css/screens.css:17 /* Extras: the labelled pieces show the brass ring on hover and
css/screens.css:31 /* Title is extruded like the lid lettering of a board-game box
css/screens.css:56 /* Map: the run is a printed track on a game sheet.
css/screens.css:88 /* Mini-jefe: el rombo de latón. La ficha gira 45° y escala 0.7
css/screens.css:92 /* El troquel dice qué es el nodo: cuadrada y verde = minijuego
css/screens.css:105 /* Setup and settings
css/screens.css:144 /* Muestra de mesa en la tienda: damero de sus casillas sobre s
css/screens.css:159 /* Rewards
css/screens.css:162 /* Elegir premio: la carta tocada avanza y las otras se apagan 
css/screens.css:166 /* En teléfono no caben a lo ancho: abanico superpuesto sin scr
css/screens.css:179 /* Game: the board is the focal point, the HUD is a score sheet
css/screens.css:185 /* Organizar: barra de la fase previa, encima del tablero.
css/screens.css:195 /* Pellizco: el botón cuadrado devuelve el encuadre cuando hay 
css/screens.css:263 /* Hand of tactic cards: fanned in the bottom-left corner, like
css/screens.css:264 /* Its own strip under the board, so cards never cover pieces; 
css/screens.css:265 /* La carta de mano se dibuja siempre a 120px de ancho y el blo
css/screens.css:278 /* Rareza visible en la mano: la gema de la carta grande, en pe
css/screens.css:289 /* What the aimed card would do: a paper slip centred above the
css/screens.css:297 /* Foreground moments (src/ui/moments.js). Colour says who bene
css/screens.css:334 /* Piece demo: a small board with the usual reach (ink dots) an
css/screens.css:348 /* Callout tiers: major lands bigger, info reads small and ligh
css/screens.css:353 /* Trim the line box to cap height so big display text centres 
css/screens.css:370 /* Overlays
css/screens.css:376 /* Pausa: solo las mesas que tienes, en una tira que se desliza
css/screens.css:395 /* Rubber stamp: the result is "stamped" onto the score sheet.
css/screens.css:402 /* Animation lab (lab.html)
css/screens.css:412 /* El laboratorio también sirve en móvil: el menú pasa arriba y
css/screens.css:424 /* Minigames (src/ui/screens/connect4.js …): same table, same t
css/screens.css:426 /* El tablero mide su hueco real (cqw/cqh), como el tablero gra
css/screens.css:430 /* En la run el nivel lo fija el piso: se anuncia como dato, si
css/screens.css:432 /* Ayuda y nivel en un solo botón: las reglas y el selector viv
css/screens.css:439 /* Minijuegos con tablero vertical: en pantalla ancha el tabler
css/screens.css:446 /* El texto de turno cambia de largo: reservar dos líneas evita
css/screens.css:454 /* Cierre de minijuego: misma superficie que los tableros (gran
css/screens.css:461 /* Onboarding de Yo, Zombi: el paso activo queda encendido y lo
css/screens.css:478 /* The hole: a dark well cut into the board, so tokens read as 
css/screens.css:485 /* La ficha fantasma asoma en la casilla donde caería tu próxim
css/screens.css:489 /* La ficha cuadrada del minijuego, versión lista: misma forma 
css/screens.css:491 /* Jardín Zen: un karesansui sobre la mesa. Marco de madera, ar
css/screens.css:499 /* El cantero arranca en 4×4 y crece hasta 8×8: la pantalla man
css/screens.css:525 /* Las plantas se mecen despacio, cada una a su ritmo (--d).
css/screens.css:528 /* Burbuja de necesidad, como en PvZ: gota si falta riego, tije
css/screens.css:541 /* Maceta con planta: anclada a su base, sombra de contacto en 
css/screens.css:549 /* Esmalte de la maceta y color de la flor por especie; la vací
css/screens.css:573 /* Estanque: orilla de musgo, agua con hondura, koi, nenúfares,
css/screens.css:593 /* Musgo, pisadera y farol.
css/screens.css:604 /* La rama de arce asoma por la esquina y suelta, muy de vez en
css/screens.css:613 /* Hojas caídas sobre la arena: se tocan para barrerlas.
css/screens.css:618 /* Asa de las animaciones de la planta: escala desde donde nace
css/screens.css:620 /* Tierra húmeda tras regar, hasta que la flor abre.
css/screens.css:622 /* La regadera aparece sobre la maceta, se inclina, riega y se 
css/screens.css:634 /* El chorro sale del pico mientras la regadera está inclinada;
css/screens.css:639 /* Herramientas: dibujo común.
css/screens.css:649 /* La mano: la herramienta elegida acompaña al ratón sobre el j
css/screens.css:659 /* El gesto al tocar: las tijeras bajan al tallo y cortan dos v
css/screens.css:675 /* Mariposa: vuela hasta la flor, bate las alas y se posa.
css/screens.css:685 /* Alimento de los koi: bolitas que flotan hasta que se las com
css/screens.css:687 /* Estado del jardín: una línea tranquila bajo el cantero.
css/screens.css:689 /* Panel: sobres de semillas, herramientas con mango redondo, a
css/screens.css:700 /* El sobre va cerrado arriba con la costura en zigzag de los s
css/screens.css:717 /* Ampliar: barra con precio y confirmación; al armarse se pint
css/screens.css:727 /* Tierra virgen de los anillos: se cava para hacer un tiesto; 
css/screens.css:728 /* Tierra virgen de los anillos: arena sin rastrillar, más oscu
css/screens.css:730 /* La tierra sin cavar se marca siempre con su recuadro puntead
css/screens.css:735 /* Galería: grupos de imágenes; las bloqueadas son placeholders
css/screens.css:748 /* Logros en la Galería: los mismos grupos que la pantalla de L
css/screens.css:751 /* Un jefe derrotado es un botón: su ficha de siempre, que al t
css/screens.css:761 /* Tienda del jardín: monedero, estantería y la marca de lo com
css/screens.css:764 /* Jardín Zen en pantalla ancha: el cantero ocupa la izquierda 
css/screens.css:770 /* En el teléfono la escena y el panel se apilan con su alto na
css/screens.css:782 /* Semillas en la tienda: la flor recortada sobre el verde del 
css/screens.css:797 /* Fila de tienda en teléfono: el nombre y la descripción ocupa
css/screens.css:810 /* Tienda en pantalla ancha: el catálogo de cartas a la izquier
css/screens.css:826 /* Logros: progreso total, grupos con barra y rejilla de fichas
css/screens.css:845 /* El logro que se tocó en la Galería destella al llegar.
css/screens.css:851 /* Aviso de logro: la ficha sube desde el borde inferior y se v
css/screens.css:874 /* La bomba del cañón enemigo lleva su color y un aro carmesí, 
css/screens.css:876 /* Puerta de salida, como la del NES: un portón de piedra que s
css/screens.css:882 /* Duelo: arena de papel con dos peanas en diagonal, como los c
css/screens.css:918 /* Fusión: bandeja de madera con huecos; cada ficha es una losa
css/screens.css:956 /* Tablero del Bomberman con cuerpo: la losa del cantero, celda
css/screens.css:980 /* La figura va SOBRE su peana: sin z-index la peana la tapaba 
css/screens.css:993 /* En la fila del fondo la figura se contiene para que la cabez
css/screens.css:1008 /* Matamarcianos: la bola en vuelo, las vidas y el mando de dos
css/screens.css:1013 /* Tu fila, marcada: pisarla cuesta una vida.
css/screens.css:1020 /* Hockey de mesa: un tablero de 6×10 hace de mesa, la banda es
css/screens.css:1032 /* Rayas de la mesa: la central, el círculo de saque y el área 
css/screens.css:1041 /* Lo que se mueve: origen arriba a la izquierda y el script po
css/screens.css:1045 /* La peana es la huella que choca; la torre se alza sobre ella
css/screens.css:1056 /* Regla de los siete segundos: los tres últimos, el disco parp
css/screens.css:1064 /* La mesa es alta: en el teléfono el escenario le da más alto 
css/screens.css:1067 /* Píxel: losas del tema en las casillas y lo redondo, octógono
css/screens.css:1083 /* Peón levantado mientras se arrastra, y la casilla a la que i
css/screens.css:1087 /* La valla cae en su sitio con un golpe seco.
css/screens.css:1103 /* El aro de vida del tablero (pc-hp) a escala de casilla, dent
css/screens.css:1107 /* En pantallas bajas el tablero vale más que el chrome: menos 
css/screens.css:1109 /* En el teléfono la compra se aprieta a una fila de ficha y pr
css/screens.css:1115 /* Estado de los minis sobre la losa: ficha de monedas y contad
css/screens.css:1118 /* Contadores en fila: un punto por unidad; apagado queda lo ga
css/screens.css:1122 /* La última oleada es la horda: su punto es un banderín bermel
css/screens.css:1124 /* En Yo, Zombi la fila de compra llama con un + en cada hueco 
css/screens.css:1125 /* Casillas que la defensa captura: tinte rojo, la lectura que 
css/screens.css:1128 /* Trofeo por tomar en su columna de la meta (los cerebros de I
css/screens.css:1136 /* En Última resistencia la casilla admite un plano: borde disc
css/screens.css:1139 /* El número del carril en su esquina: es la tecla que lo lanza
css/screens.css:1141 /* La bolera es apaisada: su escenario no reserva el alto pensa
css/screens.css:1145 /* La línea roja del original: hasta ahí se lanza.
css/screens.css:1148 /* La ficha que rueda va como elemento para que Motion la pueda
css/screens.css:1149 /* La ficha es una pieza de damas vista en perspectiva: disco c
css/screens.css:1161 /* Avance de la oleada con el banderín de la horda al 70 %.
css/screens.css:1168 /* La cinta: las fichas que vienen, la primera se lanza al toca
css/screens.css:1180 /* Copias de un paso ya jugado: la pieza que cae y la ficha que
css/screens.css:1187 /* Damas: la misma ficha de damas de Bolos, del color de cada b
css/screens.css:1205 /* Suelo hundido: la casilla que se cae se lee como pozo, no co
css/screens.css:1208 /* Contrabando: salida y portales se distinguen de un vistazo.
css/screens.css:1211 /* Contrabando: el destello del portal de salida.
css/screens.css:1214 /* El número de paso sobre la casilla ya pisada: la ruta se lee
css/screens.css:1218 /* Selector de mecánicas de la run: favorita en latón, vetada t
css/screens.css:1227 /* Mobile-first repair: keep the game surface visible instead o
css/screens.css:1259 /* The animation lab must give its remaining viewport to the li
css/screens.css:1302 /* Mobile: floating sandwich button for minigame controls (lab 
css/screens.css:1323 /* Ruta del caballo: la casilla que se abandona se hunde (derru
css/screens.css:1328 /* Caza de gigantes: el jefe va en su propia capa, del tamaño d
css/screens.css:1368 /* Jaque al rey del guardaespaldas.
css/screens.css:1377 /* Campo minado: lo destapado se voltea en ola desde el caballo
css/screens.css:1394 /* El rey impostor: pistas numeradas que laten, inocentes apaga
css/screens.css:1410 /* El suelo se acaba: el derrumbe ocurre también lejos de la fi
## css/tokens.css (40L)
css/tokens.css:1 /* Design tokens. Reasons for each choice live in DESIGN.md.
