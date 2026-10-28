# Mapa de símbolos (generado por tools/regen-mapa.mjs, no editar)

## src/core/rng.js (12L)
src/core/rng.js:2 +mulberry32
src/core/rng.js:10 +pickFrom
src/core/rng.js:11 +randomSeed
## src/data/bosses.js (37L)
src/data/bosses.js:6 +BOSSES
src/data/bosses.js:36 +BOSS_IDS
## src/data/garden.js (31L)
src/data/garden.js:9 +SEEDS
src/data/garden.js:16 +GARDEN_ITEMS
src/data/garden.js:23 +DIG_COOLDOWN
src/data/garden.js:25 +OBSTACLE_CHANCE
src/data/garden.js:26 +ROCK_HP
src/data/garden.js:27 +LANTERN_BOOST
src/data/garden.js:29 +LAKE_MAX
src/data/garden.js:30 +lakeCost
## src/data/mates.js (2L)
src/data/mates.js:1 +MATES
## src/data/minigame-catalog.js (34L)
src/data/minigame-catalog.js:24 SCREENS
src/data/minigame-catalog.js:33 +MINIGAMES
## src/data/modifiers.js (58L)
src/data/modifiers.js:2 +MODIFIERS
src/data/modifiers.js:54 +nodeModifier
## src/data/mutations.js (53L)
src/data/mutations.js:4 +MUTATIONS
src/data/mutations.js:16 KEYS
src/data/mutations.js:18 +countMutations
src/data/mutations.js:20 +pickMutationChoices
src/data/mutations.js:31 +EXTRA_MOVES
src/data/mutations.js:37 +applyMutations
## src/data/pickups.js (33L)
src/data/pickups.js:6 +PICKUPS
src/data/pickups.js:13 +PICKUPS_PER_BOARD
src/data/pickups.js:14 +PICKUPS_EVERY
src/data/pickups.js:15 +PICKUPS_MAX
src/data/pickups.js:18 +dropPickups
## src/data/pieces.js (31L)
src/data/pieces.js:6 +PIECES
src/data/pieces.js:21 EXTRA_PATTERNS
src/data/pieces.js:23 +PIECE_TYPES
src/data/pieces.js:25 +MINOR_TYPES
src/data/pieces.js:26 +PIECE_NAMES
src/data/pieces.js:27 +PIECE_VALUE
src/data/pieces.js:28 +PIECE_RULES
src/data/pieces.js:30 +MOVE_NAMES
## src/data/pixel-src.js (5L)
src/data/pixel-src.js:4 +pixelSrc
## src/data/scenarios.js (531L)
src/data/scenarios.js:14 +LEVELS
src/data/scenarios.js:15 N
src/data/scenarios.js:16 board
src/data/scenarios.js:17 rounds
src/data/scenarios.js:18 side
src/data/scenarios.js:19 shuffle
src/data/scenarios.js:20 taken
src/data/scenarios.js:22 spots
src/data/scenarios.js:28 rubble
src/data/scenarios.js:35 +SCENARIOS
src/data/scenarios.js:201 crossing
src/data/scenarios.js:370 routeLen
src/data/scenarios.js:390 passable
src/data/scenarios.js:399 knightRoute
src/data/scenarios.js:424 freeTiles
src/data/scenarios.js:481 WITCH_MOVES
src/data/scenarios.js:521 +buildScenario
## src/data/sfx-samples.js (115L)
src/data/sfx-samples.js:3 +SFX_SAMPLES
## src/data/themes.js (123L)
src/data/themes.js:9 +THEMES
src/data/themes.js:98 PX_IMAGES
src/data/themes.js:99 pixelImages
src/data/themes.js:110 applied
src/data/themes.js:111 +applyTheme
## src/game/achievements.js (139L)
src/game/achievements.js:7 KEY
src/game/achievements.js:8 read
src/game/achievements.js:9 write
src/game/achievements.js:12 +ACHIEVEMENT_GROUPS
src/game/achievements.js:16 +achievementGroups
src/game/achievements.js:23 +ACHIEVEMENTS
src/game/achievements.js:95 +shown
src/game/achievements.js:98 STATS_KEY
src/game/achievements.js:99 +loadStats
src/game/achievements.js:100 +bump
src/game/achievements.js:102 +collect
src/game/achievements.js:104 +loadAchievements
src/game/achievements.js:105 +saveAchievements
src/game/achievements.js:109 +award
src/game/achievements.js:122 SEEN_KEY
src/game/achievements.js:123 +loadSeen
src/game/achievements.js:124 +seePieces
src/game/achievements.js:132 MUT_KEY
src/game/achievements.js:133 +loadMutSeen
src/game/achievements.js:134 +seeMutations
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
## src/game/blind.js (79L)
src/game/blind.js:7 +DIRS
src/game/blind.js:9 +DIFFS
src/game/blind.js:15 +newBlind
src/game/blind.js:20 inside
src/game/blind.js:21 +occupied
src/game/blind.js:24 +ray
src/game/blind.js:35 +place
src/game/blind.js:49 +fire
## src/game/blizzard.js (92L)
src/game/blizzard.js:6 +DIRS
src/game/blizzard.js:8 +DIFFS
src/game/blizzard.js:14 k
src/game/blizzard.js:17 +slide
src/game/blizzard.js:31 +shortest
src/game/blizzard.js:51 +newBlizzard
src/game/blizzard.js:74 +look
src/game/blizzard.js:79 +move
## src/game/bomber.js (206L)
src/game/bomber.js:4 FUSE
src/game/bomber.js:5 L_JUMP
src/game/bomber.js:6 DIAG
src/game/bomber.js:7 DIRS
src/game/bomber.js:14 +FOES
src/game/bomber.js:21 +DIFFS
src/game/bomber.js:27 dist
src/game/bomber.js:29 +newBomber
src/game/bomber.js:57 inside
src/game/bomber.js:58 free
src/game/bomber.js:59 +doorOpen
src/game/bomber.js:63 rays
src/game/bomber.js:77 +blastOf
src/game/bomber.js:79 explode
src/game/bomber.js:95 huntStep
src/game/bomber.js:114 wander
src/game/bomber.js:124 leap
src/game/bomber.js:134 inSight
src/game/bomber.js:143 moveFoe
src/game/bomber.js:170 +step
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
## src/game/cards.js (125L)
src/game/cards.js:9 behind
src/game/cards.js:10 occupiedBy
src/game/cards.js:11 freeTile
src/game/cards.js:13 growDir
src/game/cards.js:15 +CARDS
src/game/cards.js:72 +CARD_IDS
src/game/cards.js:73 +HAND_LIMIT
src/game/cards.js:74 +STARTER_CARDS
src/game/cards.js:76 +pickCardChoices
src/game/cards.js:85 +cardTargets
src/game/cards.js:97 +previewMoves
src/game/cards.js:109 +playCard
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
## src/game/difficulty.js (124L)
src/game/difficulty.js:9 +floorTier
src/game/difficulty.js:13 BAND
src/game/difficulty.js:14 +bandOf
src/game/difficulty.js:20 +RIVALS
src/game/difficulty.js:34 +RIVAL_STEPS
src/game/difficulty.js:35 TIER_STEP
src/game/difficulty.js:39 +DIFFICULTIES
src/game/difficulty.js:47 +rivalForFloor
src/game/difficulty.js:58 TUNING
src/game/difficulty.js:62 weightsOf
src/game/difficulty.js:63 +MOD_WEIGHTS
src/game/difficulty.js:64 +MINI_WEIGHTS
src/game/difficulty.js:65 +isMiniModifier
src/game/difficulty.js:67 draw
src/game/difficulty.js:78 +FAV_WEIGHT
src/game/difficulty.js:79 +pickModifier
src/game/difficulty.js:94 +miniBossFloors
src/game/difficulty.js:111 +MINI_BOSSES
src/game/difficulty.js:112 +FINAL_BOSSES
src/game/difficulty.js:117 +RARE_TYPES
src/game/difficulty.js:118 +ARMY_STEPS
src/game/difficulty.js:123 +armyForFloor
## src/game/duel.js (98L)
src/game/duel.js:6 +BEATS
src/game/duel.js:7 +TYPE_NAME
src/game/duel.js:11 +MOVES
src/game/duel.js:28 +FIGHTERS
src/game/duel.js:40 +DIFFS
src/game/duel.js:46 unit
src/game/duel.js:48 +newDuel
src/game/duel.js:53 +active
src/game/duel.js:54 +effect
src/game/duel.js:57 strike
src/game/duel.js:76 foeChoice
src/game/duel.js:86 +turn
## src/game/fusion.js (70L)
src/game/fusion.js:4 +LADDER
src/game/fusion.js:6 +DIFFS
src/game/fusion.js:11 DIRS
src/game/fusion.js:13 +newFusion
src/game/fusion.js:20 at
src/game/fusion.js:22 spawn
src/game/fusion.js:34 +slide
src/game/fusion.js:65 canMove
## src/game/generate.js (447L)
src/game/generate.js:9 +generateMap
src/game/generate.js:79 LESSONS
src/game/generate.js:86 +lessonText
src/game/generate.js:89 +tutorialMap
src/game/generate.js:98 SHAPES
src/game/generate.js:101 +generateBoard
src/game/generate.js:155 +addTerrain
src/game/generate.js:176 BACK_RANK
src/game/generate.js:183 SECOND_RANK
src/game/generate.js:190 pawnRank
src/game/generate.js:191 centered
src/game/generate.js:195 FORMATIONS
src/game/generate.js:202 FORMATION_POOL
src/game/generate.js:206 DEPLOYS
src/game/generate.js:212 DEPLOY_POOL
src/game/generate.js:213 spread
src/game/generate.js:220 nextId
src/game/generate.js:222 +reserveIds
src/game/generate.js:223 +makePiece
src/game/generate.js:231 +ELITE_RULES
src/game/generate.js:235 +eliteVariants
src/game/generate.js:241 protectElites
src/game/generate.js:256 ensureRare
src/game/generate.js:267 strikesSoon
src/game/generate.js:272 quickThreats
src/game/generate.js:282 +placePieces
src/game/generate.js:293 placeOnce
src/game/generate.js:411 +placeBoss
## src/game/hockey.js (221L)
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
src/game/hockey.js:34 +newHockey
src/game/hockey.js:42 serve
src/game/hockey.js:51 +aim
src/game/hockey.js:57 drive
src/game/hockey.js:68 +predictX
src/game/hockey.js:77 +think
src/game/hockey.js:119 bounceMallet
src/game/hockey.js:139 capSpeed
src/game/hockey.js:145 walls
src/game/hockey.js:166 wall
src/game/hockey.js:170 +step
src/game/hockey.js:178 sub
## src/game/izombie.js (96L)
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
## src/game/match.js (388L)
src/game/match.js:10 +QUIET_LIMIT
src/game/match.js:11 +METEOR_EVERY
src/game/match.js:13 +Match
src/game/match.js:292 cheapestAttacker
src/game/match.js:306 STATE
src/game/match.js:307 toJSON
src/game/match.js:308 fromJSON
src/game/match.js:309 +freezeMatch
src/game/match.js:315 +thawMatch
src/game/match.js:329 +botChooseMove
## src/game/mates.js (95L)
src/game/mates.js:7 +SIZE
src/game/mates.js:8 +board
src/game/mates.js:11 +DIFFS
src/game/mates.js:17 +fromSpec
src/game/mates.js:19 +play
src/game/mates.js:29 pseudoMoves
src/game/mates.js:32 +moves
src/game/mates.js:33 kingOf
src/game/mates.js:34 kingDead
src/game/mates.js:35 hitsKing
src/game/mates.js:37 +inCheck
src/game/mates.js:45 +legalChessMoves
src/game/mates.js:54 +isCheckmate
src/game/mates.js:59 +capturesKing
src/game/mates.js:60 +captureMove
src/game/mates.js:67 +mateKeys
src/game/mates.js:83 +solve
src/game/mates.js:87 +defend
## src/game/outbreak.js (77L)
src/game/outbreak.js:7 TYPES
src/game/outbreak.js:8 +DIFFS
src/game/outbreak.js:15 +chain
src/game/outbreak.js:35 +fewest
src/game/outbreak.js:49 +newOutbreak
src/game/outbreak.js:68 +dose
## src/game/queens.js (27L)
src/game/queens.js:3 +DIFFS
src/game/queens.js:9 attacks
src/game/queens.js:11 +newQueens
src/game/queens.js:16 +clashing
src/game/queens.js:18 +toggle
## src/game/rules.js (230L)
src/game/rules.js:6 +key
src/game/rules.js:8 +linkPortalPair
src/game/rules.js:16 +portalAt
src/game/rules.js:22 +sizeOf
src/game/rules.js:24 +cellsOf
src/game/rules.js:31 +buildOccupancy
src/game/rules.js:37 +ctxOf
src/game/rules.js:38 inBounds
src/game/rules.js:39 +walkable
src/game/rules.js:44 +immune
src/game/rules.js:51 +landing
src/game/rules.js:64 free
src/game/rules.js:73 pathClear
src/game/rules.js:83 forward
src/game/rules.js:85 canMoveAs
src/game/rules.js:137 +moveTypesOf
src/game/rules.js:142 canMove
src/game/rules.js:147 +pieceCanMove
src/game/rules.js:153 +canHit
src/game/rules.js:162 +legalMoves
src/game/rules.js:171 +hasAnyLegalMove
src/game/rules.js:177 +threatenedPieces
src/game/rules.js:189 +moveCells
src/game/rules.js:197 +anchorForCell
src/game/rules.js:213 +reachPreview
## src/game/run.js (81L)
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
src/game/run.js:30 +enterLevel
src/game/run.js:31 +resetLevel
src/game/run.js:32 +dropLevel
src/game/run.js:34 +completeNode
src/game/run.js:43 +isAvailable
src/game/run.js:54 MINIS_KEY
src/game/run.js:55 +loadUnlocked
src/game/run.js:56 +unlockMini
src/game/run.js:59 BOSSES_KEY
src/game/run.js:60 +loadBosses
src/game/run.js:61 +unlockBoss
src/game/run.js:63 +DEFAULT_SETTINGS
src/game/run.js:65 +loadSettings
src/game/run.js:69 +saveSettings
src/game/run.js:73 DEMO_KEY
src/game/run.js:74 +takeNewDemos
## src/game/shop.js (79L)
src/game/shop.js:6 KEY
src/game/shop.js:7 read
src/game/shop.js:8 write
src/game/shop.js:10 +CARD_PRICE
src/game/shop.js:12 +COINS_PER_NODE
src/game/shop.js:14 +THEME_SHOP
src/game/shop.js:15 +PENDING_LIMIT
src/game/shop.js:17 +loadShop
src/game/shop.js:25 +saveShop
src/game/shop.js:27 +addCoins
src/game/shop.js:34 +charge
src/game/shop.js:36 +themeOwned
src/game/shop.js:37 +grantTheme
src/game/shop.js:46 +addPending
src/game/shop.js:52 +takePending
src/game/shop.js:61 +addToHand
src/game/shop.js:74 +consumeCard
src/game/shop.js:78 +isShopCard
## src/game/zen.js (284L)
src/game/zen.js:8 KEY
src/game/zen.js:9 read
src/game/zen.js:10 write
src/game/zen.js:12 +ZEN_KINDS
src/game/zen.js:13 +ZEN_NAMES
src/game/zen.js:14 +ZEN_BASE
src/game/zen.js:15 +ZEN_MAX
src/game/zen.js:19 bloomMs
src/game/zen.js:22 +BASE_GRID
src/game/zen.js:29 +BASE_KEYS
src/game/zen.js:31 +cellKey
src/game/zen.js:32 +parseKey
src/game/zen.js:34 +expandCost
src/game/zen.js:40 +blankZen
src/game/zen.js:45 withBase
src/game/zen.js:57 seedsOf
src/game/zen.js:59 +loadZen
src/game/zen.js:75 movedPot
src/game/zen.js:76 +saveZen
src/game/zen.js:80 +lakeBox
src/game/zen.js:81 +inLake
src/game/zen.js:84 +cellType
src/game/zen.js:94 lit
src/game/zen.js:100 +zenStage
src/game/zen.js:111 +zenSow
src/game/zen.js:122 +zenWater
src/game/zen.js:130 +zenWaterAround
src/game/zen.js:138 +digWait
src/game/zen.js:141 +zenDig
src/game/zen.js:146 +zenBreak
src/game/zen.js:155 +zenHarvest
src/game/zen.js:171 +zenExpand
src/game/zen.js:187 +zenClear
src/game/zen.js:194 +zenStore
src/game/zen.js:209 +zenLake
src/game/zen.js:226 +zenPlace
src/game/zen.js:242 +addZenItem
src/game/zen.js:251 +LEAF_MS
src/game/zen.js:252 +LEAF_MAX
src/game/zen.js:253 +LEAF_COINS
src/game/zen.js:254 +zenLeaves
src/game/zen.js:263 +zenSweep
src/game/zen.js:266 +BUTTERFLY_MS
src/game/zen.js:267 +butterflyGift
src/game/zen.js:272 +addZenSeeds
src/game/zen.js:279 +pickSeed
## src/i18n/en.js (1029L)
## src/i18n/index.js (46L)
src/i18n/index.js:5 +LANGS
src/i18n/index.js:7 saved
src/i18n/index.js:13 browser
src/i18n/index.js:18 +LANG
src/i18n/index.js:19 dict
src/i18n/index.js:23 +t
src/i18n/index.js:29 plural
src/i18n/index.js:30 +tp
src/i18n/index.js:36 +localize
## src/lab-catalog.js (71L)
src/lab-catalog.js:2 FALLBACK_THEMES
src/lab-catalog.js:10 THEMES
src/lab-catalog.js:22 BOARD_VARIANTS
src/lab-catalog.js:24 MINIS
src/lab-catalog.js:30 themeSelect
src/lab-catalog.js:31 miniSelect
src/lab-catalog.js:32 difficulty
src/lab-catalog.js:33 frame
src/lab-catalog.js:35 fillSelect
src/lab-catalog.js:53 updatePreview
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
## src/main.js (7L)
## src/ui/app.js (380L)
src/ui/app.js:31 REST_CARDS
src/ui/app.js:36 BAG_CARDS
src/ui/app.js:43 shuffle3
src/ui/app.js:45 MINI_PRIZES
src/ui/app.js:46 ONE_SHOT
src/ui/app.js:48 +App
src/ui/app.js:336 MutationReveal
src/ui/app.js:352 AchievementToast
## src/ui/coins.js (22L)
src/ui/coins.js:6 reduced
src/ui/coins.js:8 +flyCoins
## src/ui/components.js (225L)
src/ui/components.js:12 +ThemeLook
src/ui/components.js:20 +Topbar
src/ui/components.js:33 +MiniEnd
src/ui/components.js:43 diffName
src/ui/components.js:48 +MiniDiff
src/ui/components.js:64 +MiniTools
src/ui/components.js:114 +ConfirmButton
src/ui/components.js:125 +BossCard
src/ui/components.js:138 +useEnter
src/ui/components.js:146 Card
src/ui/components.js:163 KIND_LABEL
src/ui/components.js:164 +RARITY_LABEL
src/ui/components.js:168 +CardFace
src/ui/components.js:182 +CardPick
src/ui/components.js:208 +TurnBanner
src/ui/components.js:219 +Toggle
## src/ui/demos.js (31L)
src/ui/demos.js:10 +pieceDemo
src/ui/demos.js:15 +mutationDemo
src/ui/demos.js:24 +bossDemo
src/ui/demos.js:30 +playDemo
## src/ui/fullscreen.js (23L)
src/ui/fullscreen.js:5 +canFullscreen
src/ui/fullscreen.js:6 isFull
src/ui/fullscreen.js:8 +setFullscreen
src/ui/fullscreen.js:14 +useFullscreen
## src/ui/gamepad.js (205L)
src/ui/gamepad.js:14 BUTTONS
src/ui/gamepad.js:15 DIRS
src/ui/gamepad.js:16 SECOND
src/ui/gamepad.js:17 ACTIONS
src/ui/gamepad.js:18 FIRST
src/ui/gamepad.js:19 FOCUSABLE
src/ui/gamepad.js:20 CLICKABLE
src/ui/gamepad.js:23 styleOf
src/ui/gamepad.js:25 visible
src/ui/gamepad.js:30 scope
src/ui/gamepad.js:32 focus
src/ui/gamepad.js:39 moveFocus
src/ui/gamepad.js:63 declared
src/ui/gamepad.js:64 +usePad
src/ui/gamepad.js:70 entryOf
src/ui/gamepad.js:76 assigned
src/ui/gamepad.js:77 isGroup
src/ui/gamepad.js:79 act
src/ui/gamepad.js:98 targets
src/ui/gamepad.js:99 release
src/ui/gamepad.js:103 press
src/ui/gamepad.js:117 scroll
src/ui/gamepad.js:126 legend
src/ui/gamepad.js:127 paint
src/ui/gamepad.js:166 held
src/ui/gamepad.js:167 poll
src/ui/gamepad.js:195 running
src/ui/gamepad.js:196 +startGamepad
## src/ui/hop.js (79L)
src/ui/hop.js:8 OUT
src/ui/hop.js:9 +reduced
src/ui/hop.js:10 speed
src/ui/hop.js:13 gooOf
src/ui/hop.js:28 puddle
src/ui/hop.js:35 +hopPiece
src/ui/hop.js:74 +popPiece
## src/ui/icons.js (108L)
src/ui/icons.js:8 CUT
src/ui/icons.js:9 cut
src/ui/icons.js:10 dot
src/ui/icons.js:13 f3
src/ui/icons.js:14 bar
src/ui/icons.js:19 rot
src/ui/icons.js:21 P
src/ui/icons.js:90 OFFSET
src/ui/icons.js:97 +Icon
src/ui/icons.js:105 +PieceIcon
## src/ui/lib.js (8L)
src/ui/lib.js:4 +html
## src/ui/mini-board.js (74L)
src/ui/mini-board.js:11 +MiniBoard
src/ui/mini-board.js:31 sync
src/ui/mini-board.js:73 +zombies
## src/ui/moments.js (306L)
src/ui/moments.js:12 OUT
src/ui/moments.js:13 IN
src/ui/moments.js:14 reduced
src/ui/moments.js:15 sleep
src/ui/moments.js:17 skippable
src/ui/moments.js:27 discPx
src/ui/moments.js:35 TOSS_CROSS
src/ui/moments.js:36 tossFace
src/ui/moments.js:40 color
src/ui/moments.js:42 +Moments
## src/ui/screens/achievements.js (48L)
src/ui/screens/achievements.js:9 Bar
src/ui/screens/achievements.js:12 +AchievementsScreen
## src/ui/screens/barrier.js (132L)
src/ui/screens/barrier.js:11 KEYS
src/ui/screens/barrier.js:12 anchor
src/ui/screens/barrier.js:14 +BarrierScreen
## src/ui/screens/blind.js (87L)
src/ui/screens/blind.js:13 wait
src/ui/screens/blind.js:14 css
src/ui/screens/blind.js:15 asPiece
src/ui/screens/blind.js:17 +BlindScreen
## src/ui/screens/blizzard.js (83L)
src/ui/screens/blizzard.js:11 KEYS
src/ui/screens/blizzard.js:13 +BlizzardScreen
## src/ui/screens/bomber.js (133L)
src/ui/screens/bomber.js:13 KEYS
src/ui/screens/bomber.js:14 PAD
src/ui/screens/bomber.js:16 +BomberScreen
## src/ui/screens/bowling.js (201L)
src/ui/screens/bowling.js:12 TICK_MS
src/ui/screens/bowling.js:13 css
src/ui/screens/bowling.js:15 +BowlingScreen
## src/ui/screens/checkers.js (85L)
src/ui/screens/checkers.js:12 wait
src/ui/screens/checkers.js:15 +CheckersScreen
## src/ui/screens/connect4.js (99L)
src/ui/screens/connect4.js:10 wait
src/ui/screens/connect4.js:13 +Connect4Screen
## src/ui/screens/duel.js (118L)
src/ui/screens/duel.js:13 wait
src/ui/screens/duel.js:14 OUT
src/ui/screens/duel.js:16 Plate
src/ui/screens/duel.js:27 +DuelScreen
## src/ui/screens/fusion.js (69L)
src/ui/screens/fusion.js:12 KEYS
src/ui/screens/fusion.js:13 PAD
src/ui/screens/fusion.js:15 +FusionScreen
## src/ui/screens/gallery.js (121L)
src/ui/screens/gallery.js:20 SOON
src/ui/screens/gallery.js:26 ThemeGroup
src/ui/screens/gallery.js:41 RULE
src/ui/screens/gallery.js:42 Locked
src/ui/screens/gallery.js:44 +GalleryScreen
## src/ui/screens/game.js (801L)
src/ui/screens/game.js:30 SIDE_NAME
src/ui/screens/game.js:33 pieceName
src/ui/screens/game.js:35 TIPS
src/ui/screens/game.js:44 cardEffect
src/ui/screens/game.js:58 +GameScreen
src/ui/screens/game.js:772 EndOverlay
## src/ui/screens/hockey.js (210L)
src/ui/screens/hockey.js:13 KEYS
src/ui/screens/hockey.js:15 TOP_KEYS
src/ui/screens/hockey.js:16 css
src/ui/screens/hockey.js:19 +HockeyScreen
## src/ui/screens/izombie.js (58L)
src/ui/screens/izombie.js:12 +IZombieScreen
## src/ui/screens/laststand.js (67L)
src/ui/screens/laststand.js:12 +LastStandScreen
## src/ui/screens/map.js (71L)
src/ui/screens/map.js:11 ROW
src/ui/screens/map.js:13 +MapScreen
## src/ui/screens/marcianos.js (139L)
src/ui/screens/marcianos.js:12 css
src/ui/screens/marcianos.js:15 KEYS
src/ui/screens/marcianos.js:16 WAIT
src/ui/screens/marcianos.js:18 +MarcianosScreen
## src/ui/screens/menu.js (177L)
src/ui/screens/menu.js:14 Diorama
src/ui/screens/menu.js:102 fitCrown
src/ui/screens/menu.js:134 +MenuScreen
## src/ui/screens/mini-grid.js (22L)
src/ui/screens/mini-grid.js:6 +MiniGrid
## src/ui/screens/minis.js (21L)
src/ui/screens/minis.js:8 +MinisScreen
## src/ui/screens/outbreak.js (71L)
src/ui/screens/outbreak.js:13 wait
src/ui/screens/outbreak.js:15 +OutbreakScreen
## src/ui/screens/overlays.js (83L)
src/ui/screens/overlays.js:12 closeOnBackdrop
src/ui/screens/overlays.js:13 useEscape
src/ui/screens/overlays.js:20 +ResumeOverlay
src/ui/screens/overlays.js:31 +PauseOverlay
src/ui/screens/overlays.js:61 +HowToOverlay
## src/ui/screens/queens.js (51L)
src/ui/screens/queens.js:11 +QueensScreen
## src/ui/screens/scenario.js (35L)
src/ui/screens/scenario.js:9 RUN
src/ui/screens/scenario.js:10 noop
src/ui/screens/scenario.js:13 ScenarioScreen
src/ui/screens/scenario.js:21 screen
src/ui/screens/scenario.js:22 +CaceriaScreen
src/ui/screens/scenario.js:23 +BodyguardScreen
src/ui/screens/scenario.js:24 +GiantHuntScreen
src/ui/screens/scenario.js:25 +MinefieldScreen
src/ui/screens/scenario.js:26 +KingImpostorScreen
src/ui/screens/scenario.js:27 +EscapeScreen
src/ui/screens/scenario.js:28 +ContrabandScreen
src/ui/screens/scenario.js:29 +LaboratoryScreen
src/ui/screens/scenario.js:30 +CollapsingFloorScreen
src/ui/screens/scenario.js:31 +KnightScreen
src/ui/screens/scenario.js:32 +MatesScreen
src/ui/screens/scenario.js:33 +ClockScreen
src/ui/screens/scenario.js:34 +WitchScreen
## src/ui/screens/setup.js (196L)
src/ui/screens/setup.js:14 SIDES
src/ui/screens/setup.js:21 +RUN_MECHANICS
src/ui/screens/setup.js:22 PrefsCard
src/ui/screens/setup.js:43 VERSUS_ROUNDS
src/ui/screens/setup.js:44 VERSUS_SIZES
src/ui/screens/setup.js:45 VERSUS_SHAPES
src/ui/screens/setup.js:46 VersusCard
src/ui/screens/setup.js:83 +SetupScreen
src/ui/screens/setup.js:137 +SettingsScreen
## src/ui/screens/shop.js (143L)
src/ui/screens/shop.js:15 CARD_LIST
src/ui/screens/shop.js:17 +ShopScreen
## src/ui/screens/zen.js (595L)
src/ui/screens/zen.js:18 ETAPAS
src/ui/screens/zen.js:20 TOOLS
src/ui/screens/zen.js:29 TOOL_ART
src/ui/screens/zen.js:30 reduced
src/ui/screens/zen.js:31 later
src/ui/screens/zen.js:33 the
src/ui/screens/zen.js:34 cap
src/ui/screens/zen.js:36 ROOM
src/ui/screens/zen.js:38 INFO
src/ui/screens/zen.js:44 SOIL_COLORS
src/ui/screens/zen.js:45 OUT
src/ui/screens/zen.js:49 potArt
src/ui/screens/zen.js:58 +ZenScreen
## src/ui/sfx.js (388L)
src/ui/sfx.js:7 +SFX_VOLUMES
src/ui/sfx.js:14 JITTER
src/ui/sfx.js:15 RECIPES
src/ui/sfx.js:195 +SFX_NAMES
src/ui/sfx.js:197 enabled
src/ui/sfx.js:198 level
src/ui/sfx.js:199 ctx
src/ui/sfx.js:200 master
src/ui/sfx.js:201 ambient
src/ui/sfx.js:202 noiseBuf
src/ui/sfx.js:204 ensureCtx
src/ui/sfx.js:218 noiseBuffer
src/ui/sfx.js:227 playLayer
src/ui/sfx.js:257 +setSfxEnabled
src/ui/sfx.js:261 +setSfxVolume
src/ui/sfx.js:268 +playSfx
src/ui/sfx.js:291 last
src/ui/sfx.js:296 SAMPLE_GAIN
src/ui/sfx.js:302 buffers
src/ui/sfx.js:304 ready
src/ui/sfx.js:305 loadSamples
src/ui/sfx.js:313 playSample
src/ui/sfx.js:327 +MUSIC_MOODS
src/ui/sfx.js:328 +MUSIC_TRACKS
src/ui/sfx.js:329 MUSIC_GAIN
src/ui/sfx.js:330 tracks
src/ui/sfx.js:331 scene
src/ui/sfx.js:332 musicOn
src/ui/sfx.js:333 track
src/ui/sfx.js:338 +setMusicScene
src/ui/sfx.js:346 +setMusicEnabled
src/ui/sfx.js:352 +startAmbient
src/ui/sfx.js:373 +stopAmbient
src/ui/sfx.js:385 +sfxState
## src/ui/zen-art.js (247L)
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
src/ui/zen-art.js:224 +PICKUP_ART
src/ui/zen-art.js:229 +boardPond
src/ui/zen-art.js:235 +stoneArt
src/ui/zen-art.js:241 +ITEM_ART
src/ui/zen-art.js:246 +KOI_ART
## src/view/board-view.js (1085L)
src/view/board-view.js:15 +CAMERAS
src/view/board-view.js:16 JUMPERS
src/view/board-view.js:17 reduced
src/view/board-view.js:18 wait
src/view/board-view.js:19 css
src/view/board-view.js:21 +collapseTiles
src/view/board-view.js:33 BADGES
src/view/board-view.js:41 +BoardView
## src/view/fx.js (194L)
src/view/fx.js:6 +Fx
## src/view/liquid.js (89L)
src/view/liquid.js:6 count
src/view/liquid.js:11 +liquid
src/view/liquid.js:55 DISC
src/view/liquid.js:56 disc
src/view/liquid.js:58 pixelLiquid
## src/view/piece-art.js (130L)
src/view/piece-art.js:11 F
src/view/piece-art.js:12 STROKE
src/view/piece-art.js:14 PLINTH
src/view/piece-art.js:15 PLINTH_TOP
src/view/piece-art.js:16 CX
src/view/piece-art.js:19 BOSS_PLINTH
src/view/piece-art.js:20 isBoss
src/view/piece-art.js:25 LADDER
src/view/piece-art.js:39 boxes
src/view/piece-art.js:40 measure
src/view/piece-art.js:65 layout
src/view/piece-art.js:73 cache
src/view/piece-art.js:74 art
src/view/piece-art.js:87 PX
src/view/piece-art.js:88 PX_BOTTOM
src/view/piece-art.js:89 pixelMode
src/view/piece-art.js:91 pixelArt
src/view/piece-art.js:103 pick
src/view/piece-art.js:109 +pieceSVG
src/view/piece-art.js:123 +headTop
src/view/piece-art.js:125 +RAW_BODIES
src/view/piece-art.js:129 +artOf
## css/base.css (220L)
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
css/base.css:159 /* Mando (src/ui/gamepad.js). El botón va dentro del elemento a
css/base.css:199 /* Botones sin texto y cosas del jardín: el botón va en su esqu
css/base.css:202 /* Grupos: L a la izquierda y R a la derecha de la fila; en una
## css/board.css (319L)
css/board.css:1 /* 3D tabletop: tilted board plane, tiles with thickness, cardb
css/board.css:26 /* Liquid base while a piece moves: drawn on the board plane ju
css/board.css:36 /* Tiles
css/board.css:52 /* Front face: the board is a slab of thick card, so exposed ed
css/board.css:61 /* El punto de jugada se superpone centrado: con una moneda o u
css/board.css:64 /* Alcance de un bando (toque en su fila del panel): velo plano
css/board.css:67 /* Campo minado: lo tapado va en relieve como el buscaminas; lo
css/board.css:71 /* Rótulo con icono (muestra, salida, marca, moneda): una ficha
css/board.css:97 /* Card targeting: dashed brass outline on valid targets; previ
css/board.css:105 /* Casilla que la defensa de un minijuego captura (Yo, Zombi).
css/board.css:107 /* Terrain: ice is a pale frozen slab with cracks; portals are 
css/board.css:109 /* Agujero en el hielo (Ventisca): agua oscura con el borde rot
css/board.css:121 /* Pieces
css/board.css:125 /* Zombis de los minijuegos tipo PvZ: verde podrido, distinto d
css/board.css:127 /* Peón zombi de la Plaga: figura verde podrida, base del color
css/board.css:130 /* Contagiada: conserva el color de su bando nuevo y lleva un h
css/board.css:133 /* Posición de casillas: no se hereda. Las piezas (y su sombra)
css/board.css:146 /* Token base: three stacked discs give the coin its thickness;
css/board.css:158 /* Aiming a card: pieces it can be played on wear a dashed bras
css/board.css:177 /* En el set píxel las piezas botan un píxel justo, cada una a 
css/board.css:180 /* El sprite ya trae contorno y la peana su sombra: sin drop-sh
css/board.css:183 /* Mientras caen las piezas al empezar, quietas: el bote de 32 
css/board.css:185 /* transform y no translate: con translate el bote se recalcula
css/board.css:187 /* En el set píxel la peana también es de píxeles: disco escalo
css/board.css:199 /* Fog: an enemy far from your pieces is only a shape in the mi
css/board.css:207 /* Chrome recortaba el cartel por arriba con la caja de la pean
css/board.css:216 /* Piece badges: lock = escorted, flag = falls last, star = bor
css/board.css:245 /* Etiqueta de casilla: ficha de papel con pico, encima de la c
css/board.css:260 /* Mesa Pixelada: el set de pxl. El PNG ya trae color y contorn
css/board.css:266 /* Fondos del tema píxel (art/temas/<tema>, variables puestas p
css/board.css:283 /* Estanque del centro abierto y coleccionables: tumbados sobre
css/board.css:300 /* La mariposa queda posada un poco en el aire (lo deja su vuel
css/board.css:306 /* Meteorito: la cruz avisada late en rojo; la roca cae encendi
css/board.css:314 /* Ventisca: bloque de hielo (frena al que resbala) y casillas 
## css/pixel.css (93L)
css/pixel.css:1 /* Modo píxel: con un tema píxel (data-art="pixel", ver src/dat
css/pixel.css:6 /* Jersey 10 (OFL), servida desde el juego: el subconjunto lati
css/pixel.css:20 /* Solo elementos: con ::before y ::after el navegador calculab
css/pixel.css:24 /* Los dibujos vectoriales (iconos, jardín, minijuegos) sin sua
css/pixel.css:28 /* Marcos del tema: el borde es la imagen cortada en nueve (esq
css/pixel.css:32 /* Mando: botones y leyenda con el marco del tema, como los bot
css/pixel.css:38 /* Botón de 8 bits: el marco tiene las esquinas en escalera y t
css/pixel.css:53 /* La fuente bitmap es más ancha: el nombre largo baja un punto
css/pixel.css:60 /* Tableros de los minijuegos: las mismas losas del tema que el
css/pixel.css:66 /* Jardín Zen: cada dibujo trae su sprite (zen-art.js) y aquí s
css/pixel.css:75 /* La moneda de cara o cruz, en escalones.
css/pixel.css:83 /* Sombra de la pieza y koi del estanque del tablero, sin degra
css/pixel.css:85 /* Fichas de damas (bolos, damas, Conecta 4): disco escalonado 
## css/screens.css (1402L)
css/screens.css:1 /* Screen layouts: menu, map, setup/settings, rewards, game HUD
css/screens.css:3 /* Curtain wipe between screens: the one authored transition of
css/screens.css:12 /* Menu: asymmetric, the diorama is the focal point and the tit
css/screens.css:17 /* Extras: the labelled pieces show the brass ring on hover and
css/screens.css:20 /* Secreto del menú: el Titán se sacude cuando lo tocan.
css/screens.css:34 /* La columna mide lo que el título: texto y botones no aportan
css/screens.css:37 /* Title is extruded like the lid lettering of a board-game box
css/screens.css:44 /* Logotipo: «Kure'i» con relleno de tablero y la corona sobre 
css/screens.css:51 /* La corona hace de punto de la ı: centrada en el palo medido 
css/screens.css:67 /* Chaos no se está quieto: cada letra cabecea a su ritmo.
css/screens.css:68 /* Un solo transform (no rotate + translate): animar dos propie
css/screens.css:74 /* Entrada: el nombre cae y rebota, la cinta llega de un golpe.
css/screens.css:76 /* Tras llegar, la cinta se balancea como un sube y baja: el ce
css/screens.css:86 /* Botones del menú: icono en una ficha a la izquierda y el tex
css/screens.css:95 /* El botón principal invita: la flecha empuja hacia delante ca
css/screens.css:117 /* Móvil bajo: sin la frase, el tablero de la portada conserva 
css/screens.css:123 /* Map: the run is a printed track on a game sheet.
css/screens.css:155 /* Mini-jefe: el rombo de latón. La ficha gira 45° y escala 0.7
css/screens.css:159 /* El troquel dice qué es el nodo: cuadrada y verde = minijuego
css/screens.css:172 /* Setup and settings
css/screens.css:176 /* Partida local, pestaña Minijuegos: lista de los que se juega
css/screens.css:181 /* Pantalla ancha (PC, tableta): las tarjetas se reparten en do
css/screens.css:222 /* Muestra de mesa en la tienda: damero de sus casillas sobre s
css/screens.css:237 /* Rewards
css/screens.css:240 /* Elegir premio: la carta tocada avanza y las otras se apagan 
css/screens.css:244 /* En teléfono no caben a lo ancho: abanico superpuesto sin scr
css/screens.css:257 /* Game: the board is the focal point, the HUD is a score sheet
css/screens.css:263 /* Organizar: barra de la fase previa, encima del tablero.
css/screens.css:273 /* Pellizco: el botón cuadrado devuelve el encuadre cuando hay 
css/screens.css:343 /* Hand of tactic cards: fanned in the bottom-left corner, like
css/screens.css:344 /* Its own strip under the board, so cards never cover pieces; 
css/screens.css:345 /* La carta de mano se dibuja siempre a 120px de ancho y el blo
css/screens.css:358 /* Rareza visible en la mano: la gema de la carta grande, en pe
css/screens.css:369 /* What the aimed card would do: a paper slip centred above the
css/screens.css:377 /* Foreground moments (src/ui/moments.js). Colour says who bene
css/screens.css:412 /* Proporcional al título: con px fijos se veía chica en PC y e
css/screens.css:419 /* Piece demo: a small board with the usual reach (ink dots) an
css/screens.css:433 /* Callout tiers: major lands bigger, info reads small and ligh
css/screens.css:438 /* Trim the line box to cap height so big display text centres 
css/screens.css:455 /* Overlays
css/screens.css:461 /* Pausa: solo las mesas que tienes, en una tira que se desliza
css/screens.css:480 /* Rubber stamp: the result is "stamped" onto the score sheet.
css/screens.css:487 /* Animation lab (lab.html)
css/screens.css:497 /* El laboratorio también sirve en móvil: el menú pasa arriba y
css/screens.css:509 /* Minigames (src/ui/screens/connect4.js …): same table, same t
css/screens.css:511 /* El tablero mide su hueco real (cqw/cqh), como el tablero gra
css/screens.css:515 /* En la run el nivel lo fija el piso: se anuncia como dato, si
css/screens.css:517 /* Ayuda y nivel en un solo botón: las reglas y el selector viv
css/screens.css:524 /* Minijuegos con tablero vertical: en pantalla ancha el tabler
css/screens.css:531 /* El texto de turno cambia de largo: reservar dos líneas evita
css/screens.css:539 /* Cierre de minijuego: misma superficie que los tableros (gran
css/screens.css:546 /* Onboarding de Yo, Zombi: el paso activo queda encendido y lo
css/screens.css:563 /* The hole: a dark well cut into the board, so tokens read as 
css/screens.css:570 /* La ficha fantasma asoma en la casilla donde caería tu próxim
css/screens.css:574 /* La ficha cuadrada del minijuego, versión lista: misma forma 
css/screens.css:576 /* Jardín Zen: un karesansui sobre la mesa. Marco de madera, ar
css/screens.css:584 /* El cantero arranca en 4×4 y crece hasta 8×8: la pantalla man
css/screens.css:608 /* En el cantero cada objeto deja aire a los lados: macetas vec
css/screens.css:610 /* Centrado como las macetas: mismo margen a cada lado (.zn-tra
css/screens.css:612 /* Luz del farol: las nueve casillas que acelera, recortada por
css/screens.css:616 /* Las plantas se mecen despacio, cada una a su ritmo (--d).
css/screens.css:619 /* Burbuja de necesidad, como en PvZ: gota si falta riego, tije
css/screens.css:632 /* Maceta con planta: anclada a su base, sombra de contacto en 
css/screens.css:640 /* Esmalte de la maceta y color de la flor por especie; la vací
css/screens.css:664 /* Estanque: orilla de musgo, agua con hondura, koi, nenúfares,
css/screens.css:684 /* Musgo, pisadera y farol.
css/screens.css:695 /* Piedras de la tierra nueva: canto rodado con la cara al sol 
css/screens.css:703 /* La rama de arce asoma por la esquina y suelta, muy de vez en
css/screens.css:712 /* Hojas caídas sobre la arena: se tocan para barrerlas.
css/screens.css:717 /* Asa de las animaciones de la planta: escala desde donde nace
css/screens.css:719 /* Tierra húmeda tras regar, hasta que la flor abre.
css/screens.css:721 /* La regadera aparece sobre la maceta, se inclina, riega y se 
css/screens.css:733 /* El chorro sale del pico mientras la regadera está inclinada;
css/screens.css:738 /* Herramientas: dibujo común.
css/screens.css:748 /* La mano: la herramienta elegida acompaña al ratón sobre el j
css/screens.css:758 /* El gesto al tocar: las tijeras bajan al tallo y cortan dos v
css/screens.css:774 /* Mariposa: vuela hasta la flor, bate las alas y se posa.
css/screens.css:784 /* Alimento de los koi: bolitas que flotan hasta que se las com
css/screens.css:786 /* Estado del jardín: una línea tranquila bajo el cantero.
css/screens.css:788 /* Panel: sobres de semillas, herramientas con mango redondo, a
css/screens.css:799 /* El sobre va cerrado arriba con la costura en zigzag de los s
css/screens.css:817 /* Tienda: la acción principal del panel, rellena de latón, con
css/screens.css:826 /* Ampliar: barra con precio y confirmación; al armarse se pint
css/screens.css:838 /* Tierra virgen de los anillos: se cava para hacer un tiesto; 
css/screens.css:839 /* Tierra virgen de los anillos: arena sin rastrillar, más oscu
css/screens.css:841 /* La tierra sin cavar se marca siempre con su recuadro puntead
css/screens.css:846 /* Galería: grupos de imágenes; las bloqueadas son placeholders
css/screens.css:849 /* Celdas del mismo ancho: el nombre, corto o largo, no descuad
css/screens.css:860 /* Logros en la Galería: los mismos grupos que la pantalla de L
css/screens.css:863 /* Un jefe derrotado es un botón: su ficha de siempre, que al t
css/screens.css:875 /* Tienda del jardín: monedero, estantería y la marca de lo com
css/screens.css:878 /* Jardín Zen en pantalla ancha: el cantero ocupa la izquierda 
css/screens.css:884 /* En el teléfono la escena y el panel se apilan con su alto na
css/screens.css:898 /* Semillas en la tienda: la flor recortada sobre el verde del 
css/screens.css:913 /* Fila de tienda en teléfono: el nombre y la descripción ocupa
css/screens.css:926 /* Tienda en pantalla ancha: el catálogo de cartas a la izquier
css/screens.css:942 /* Logros: progreso total, grupos con barra y rejilla de fichas
css/screens.css:961 /* El logro que se tocó en la Galería destella al llegar.
css/screens.css:967 /* Aviso de logro: la ficha sube desde el borde inferior y se v
css/screens.css:990 /* La bomba del cañón enemigo lleva su color y un aro carmesí, 
css/screens.css:992 /* Puerta de salida, como la del NES: un portón de piedra que s
css/screens.css:998 /* Duelo: arena de papel con dos peanas en diagonal, como los c
css/screens.css:1034 /* Fusión: bandeja de madera con huecos; cada ficha es una losa
css/screens.css:1072 /* Tablero del Bomberman con cuerpo: la losa del cantero, celda
css/screens.css:1080 /* El marco de losa: el mismo para el tablero de minijuego (Boa
css/screens.css:1099 /* La figura va SOBRE su peana: sin z-index la peana la tapaba 
css/screens.css:1112 /* En la fila del fondo la figura se contiene para que la cabez
css/screens.css:1127 /* Matamarcianos: la bola en vuelo, las vidas y el mando de dos
css/screens.css:1132 /* Tu fila, marcada: pisarla cuesta una vida.
css/screens.css:1139 /* Hockey de mesa: un tablero de 6×10 hace de mesa, la banda es
css/screens.css:1151 /* Rayas de la mesa: la central, el círculo de saque y el área 
css/screens.css:1160 /* Lo que se mueve: origen arriba a la izquierda y el script po
css/screens.css:1164 /* La peana es la huella que choca; la torre se alza sobre ella
css/screens.css:1175 /* Regla de los siete segundos: los tres últimos, el disco parp
css/screens.css:1183 /* La mesa es alta: en el teléfono el escenario le da más alto 
css/screens.css:1186 /* Píxel: losas del tema en las casillas y lo redondo, octógono
css/screens.css:1202 /* Peón levantado mientras se arrastra, y la casilla a la que i
css/screens.css:1206 /* La valla cae en su sitio con un golpe seco.
css/screens.css:1219 /* El aro de vida del tablero (pc-hp) a escala de casilla, dent
css/screens.css:1223 /* En pantallas bajas el tablero vale más que el chrome: menos 
css/screens.css:1225 /* En el teléfono la compra se aprieta a una fila de ficha y pr
css/screens.css:1231 /* Estado de los minis sobre la losa: ficha de monedas y contad
css/screens.css:1234 /* Contadores en fila: un punto por unidad; apagado queda lo ga
css/screens.css:1238 /* La última oleada es la horda: su punto es un banderín bermel
css/screens.css:1241 /* El número del carril en su esquina: es la tecla que lo lanza
css/screens.css:1243 /* La bolera es apaisada: su escenario no reserva el alto pensa
css/screens.css:1247 /* La línea roja del original: hasta ahí se lanza.
css/screens.css:1249 /* La ficha que rueda va como elemento para que Motion la pueda
css/screens.css:1250 /* La ficha es una pieza de damas vista en perspectiva: disco c
css/screens.css:1260 /* Cara o cruz: la misma ficha, de canto a cara; marfil por del
css/screens.css:1278 /* Avance de la oleada con el banderín de la horda al 70 %.
css/screens.css:1285 /* La cinta: las fichas que vienen, la primera se lanza al toca
css/screens.css:1297 /* Copias de un paso ya jugado: la pieza que cae y la ficha que
css/screens.css:1302 /* Selector de mecánicas de la run: favorita en latón, vetada t
css/screens.css:1311 /* Mobile-first repair: keep the game surface visible instead o
css/screens.css:1343 /* The animation lab must give its remaining viewport to the li
css/screens.css:1386 /* Móvil: «Cómo se juega» va arriba a la derecha, a la altura d
## css/tokens.css (40L)
css/tokens.css:1 /* Design tokens. Reasons for each choice live in DESIGN.md.
