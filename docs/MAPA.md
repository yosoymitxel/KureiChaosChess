# Mapa de símbolos (generado por tools/regen-mapa.mjs, no editar)

## src/core/rng.js (12L)
src/core/rng.js:2 +mulberry32
src/core/rng.js:10 +pickFrom
src/core/rng.js:11 +randomSeed
## src/data/bosses.js (36L)
src/data/bosses.js:5 +BOSSES
src/data/bosses.js:35 +BOSS_IDS
## src/data/garden.js (29L)
src/data/garden.js:8 +SEEDS
src/data/garden.js:15 +GARDEN_ITEMS
src/data/garden.js:22 +DIG_COOLDOWN
src/data/garden.js:23 +ROCK_CHANCE
src/data/garden.js:24 +ROCK_HP
src/data/garden.js:25 +LANTERN_BOOST
src/data/garden.js:27 +LAKE_MAX
src/data/garden.js:28 +lakeCost
## src/data/mates.js (2L)
src/data/mates.js:1 +MATES
## src/data/minigame-catalog.js (31L)
src/data/minigame-catalog.js:21 SCREENS
src/data/minigame-catalog.js:30 +MINIGAMES
## src/data/modifiers.js (55L)
src/data/modifiers.js:1 +MODIFIERS
src/data/modifiers.js:51 +nodeModifier
## src/data/mutations.js (52L)
src/data/mutations.js:3 +MUTATIONS
src/data/mutations.js:15 KEYS
src/data/mutations.js:17 +countMutations
src/data/mutations.js:19 +pickMutationChoices
src/data/mutations.js:30 +EXTRA_MOVES
src/data/mutations.js:36 +applyMutations
## src/data/pickups.js (28L)
src/data/pickups.js:5 +PICKUPS
src/data/pickups.js:10 +PICKUPS_PER_BOARD
src/data/pickups.js:13 +dropPickups
## src/data/pieces.js (30L)
src/data/pieces.js:5 +PIECES
src/data/pieces.js:20 EXTRA_PATTERNS
src/data/pieces.js:22 +PIECE_TYPES
src/data/pieces.js:24 +MINOR_TYPES
src/data/pieces.js:25 +PIECE_NAMES
src/data/pieces.js:26 +PIECE_VALUE
src/data/pieces.js:27 +PIECE_RULES
src/data/pieces.js:29 +MOVE_NAMES
## src/data/scenarios.js (565L)
src/data/scenarios.js:13 +LEVELS
src/data/scenarios.js:14 N
src/data/scenarios.js:15 board
src/data/scenarios.js:16 rounds
src/data/scenarios.js:17 side
src/data/scenarios.js:18 shuffle
src/data/scenarios.js:19 taken
src/data/scenarios.js:21 spots
src/data/scenarios.js:27 rubble
src/data/scenarios.js:34 +SCENARIOS
src/data/scenarios.js:200 crossing
src/data/scenarios.js:349 routeLen
src/data/scenarios.js:369 passable
src/data/scenarios.js:378 knightRoute
src/data/scenarios.js:441 freeTiles
src/data/scenarios.js:556 +buildScenario
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
## src/game/difficulty.js (123L)
src/game/difficulty.js:8 +floorTier
src/game/difficulty.js:12 BAND
src/game/difficulty.js:13 +bandOf
src/game/difficulty.js:19 +RIVALS
src/game/difficulty.js:33 +RIVAL_STEPS
src/game/difficulty.js:34 TIER_STEP
src/game/difficulty.js:38 +DIFFICULTIES
src/game/difficulty.js:46 +rivalForFloor
src/game/difficulty.js:57 TUNING
src/game/difficulty.js:61 weightsOf
src/game/difficulty.js:62 +MOD_WEIGHTS
src/game/difficulty.js:63 +MINI_WEIGHTS
src/game/difficulty.js:64 +isMiniModifier
src/game/difficulty.js:66 draw
src/game/difficulty.js:77 +FAV_WEIGHT
src/game/difficulty.js:78 +pickModifier
src/game/difficulty.js:93 +miniBossFloors
src/game/difficulty.js:110 +MINI_BOSSES
src/game/difficulty.js:111 +FINAL_BOSSES
src/game/difficulty.js:116 +RARE_TYPES
src/game/difficulty.js:117 +ARMY_STEPS
src/game/difficulty.js:122 +armyForFloor
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
## src/game/fusion.js (70L)
src/game/fusion.js:4 +LADDER
src/game/fusion.js:6 +DIFFS
src/game/fusion.js:11 DIRS
src/game/fusion.js:13 +newFusion
src/game/fusion.js:20 at
src/game/fusion.js:22 spawn
src/game/fusion.js:34 +slide
src/game/fusion.js:65 canMove
## src/game/generate.js (435L)
src/game/generate.js:8 +generateMap
src/game/generate.js:78 LESSONS
src/game/generate.js:84 +tutorialMap
src/game/generate.js:93 SHAPES
src/game/generate.js:95 +generateBoard
src/game/generate.js:149 +addTerrain
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
src/game/generate.js:255 strikesSoon
src/game/generate.js:260 quickThreats
src/game/generate.js:270 +placePieces
src/game/generate.js:281 placeOnce
src/game/generate.js:399 +placeBoss
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
## src/game/match.js (338L)
src/game/match.js:9 +QUIET_LIMIT
src/game/match.js:11 +Match
src/game/match.js:269 cheapestAttacker
src/game/match.js:282 +botChooseMove
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
## src/game/shop.js (77L)
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
src/game/shop.js:72 +consumeCard
src/game/shop.js:76 +isShopCard
## src/game/zen.js (241L)
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
src/game/zen.js:39 +blankZen
src/game/zen.js:43 seedsOf
src/game/zen.js:45 +loadZen
src/game/zen.js:60 movedPot
src/game/zen.js:61 +saveZen
src/game/zen.js:65 +lakeBox
src/game/zen.js:66 +inLake
src/game/zen.js:68 +baseCell
src/game/zen.js:71 +cellType
src/game/zen.js:80 lit
src/game/zen.js:86 +zenStage
src/game/zen.js:97 +zenSow
src/game/zen.js:108 +zenWater
src/game/zen.js:116 +zenWaterAround
src/game/zen.js:124 +digWait
src/game/zen.js:127 +zenDig
src/game/zen.js:132 +zenBreak
src/game/zen.js:141 +zenHarvest
src/game/zen.js:157 +zenExpand
src/game/zen.js:168 +zenLake
src/game/zen.js:183 +zenPlace
src/game/zen.js:199 +addZenItem
src/game/zen.js:208 +LEAF_MS
src/game/zen.js:209 +LEAF_MAX
src/game/zen.js:210 +LEAF_COINS
src/game/zen.js:211 +zenLeaves
src/game/zen.js:220 +zenSweep
src/game/zen.js:223 +BUTTERFLY_MS
src/game/zen.js:224 +butterflyGift
src/game/zen.js:229 +addZenSeeds
src/game/zen.js:236 +pickSeed
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
## src/main.js (5L)
## src/ui/app.js (325L)
src/ui/app.js:30 REST_CARDS
src/ui/app.js:35 BAG_CARDS
src/ui/app.js:42 shuffle3
src/ui/app.js:44 MINI_PRIZES
src/ui/app.js:45 ONE_SHOT
src/ui/app.js:47 +App
src/ui/app.js:281 MutationReveal
src/ui/app.js:297 AchievementToast
## src/ui/components.js (221L)
src/ui/components.js:11 +ThemeLook
src/ui/components.js:19 +Topbar
src/ui/components.js:32 +MiniEnd
src/ui/components.js:44 +MiniDiff
src/ui/components.js:60 +MiniTools
src/ui/components.js:110 +ConfirmButton
src/ui/components.js:121 +BossCard
src/ui/components.js:134 +useEnter
src/ui/components.js:142 Card
src/ui/components.js:159 KIND_LABEL
src/ui/components.js:160 +RARITY_LABEL
src/ui/components.js:164 +CardFace
src/ui/components.js:178 +CardPick
src/ui/components.js:204 +TurnBanner
src/ui/components.js:215 +Toggle
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
## src/ui/hop.js (125L)
src/ui/hop.js:8 OUT
src/ui/hop.js:9 +reduced
src/ui/hop.js:10 speed
src/ui/hop.js:11 gooCount
src/ui/hop.js:14 gooOf
src/ui/hop.js:29 liquid
src/ui/hop.js:81 +hopPiece
src/ui/hop.js:120 +popPiece
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
## src/ui/mini-board.js (69L)
src/ui/mini-board.js:9 +MiniBoard
src/ui/mini-board.js:28 sync
src/ui/mini-board.js:68 +zombies
## src/ui/moments.js (292L)
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
## src/ui/screens/barrier.js (131L)
src/ui/screens/barrier.js:10 KEYS
src/ui/screens/barrier.js:11 anchor
src/ui/screens/barrier.js:13 +BarrierScreen
## src/ui/screens/bomber.js (132L)
src/ui/screens/bomber.js:12 KEYS
src/ui/screens/bomber.js:13 PAD
src/ui/screens/bomber.js:15 +BomberScreen
## src/ui/screens/bowling.js (200L)
src/ui/screens/bowling.js:11 TICK_MS
src/ui/screens/bowling.js:12 css
src/ui/screens/bowling.js:14 +BowlingScreen
## src/ui/screens/checkers.js (77L)
src/ui/screens/checkers.js:10 wait
src/ui/screens/checkers.js:12 +CheckersScreen
## src/ui/screens/connect4.js (89L)
src/ui/screens/connect4.js:9 wait
src/ui/screens/connect4.js:11 +Connect4Screen
## src/ui/screens/duel.js (117L)
src/ui/screens/duel.js:12 wait
src/ui/screens/duel.js:13 OUT
src/ui/screens/duel.js:15 Plate
src/ui/screens/duel.js:26 +DuelScreen
## src/ui/screens/fusion.js (68L)
src/ui/screens/fusion.js:11 KEYS
src/ui/screens/fusion.js:12 PAD
src/ui/screens/fusion.js:14 +FusionScreen
## src/ui/screens/gallery.js (120L)
src/ui/screens/gallery.js:19 SOON
src/ui/screens/gallery.js:25 ThemeGroup
src/ui/screens/gallery.js:40 RULE
src/ui/screens/gallery.js:41 Locked
src/ui/screens/gallery.js:43 +GalleryScreen
## src/ui/screens/game.js (708L)
src/ui/screens/game.js:27 SIDE_NAME
src/ui/screens/game.js:30 pieceName
src/ui/screens/game.js:32 TIPS
src/ui/screens/game.js:41 cardEffect
src/ui/screens/game.js:54 +GameScreen
src/ui/screens/game.js:679 EndOverlay
## src/ui/screens/hockey.js (198L)
src/ui/screens/hockey.js:11 KEYS
src/ui/screens/hockey.js:12 css
src/ui/screens/hockey.js:14 +HockeyScreen
## src/ui/screens/izombie.js (56L)
src/ui/screens/izombie.js:10 +IZombieScreen
## src/ui/screens/laststand.js (64L)
src/ui/screens/laststand.js:10 +LastStandScreen
## src/ui/screens/map.js (69L)
src/ui/screens/map.js:9 ROW
src/ui/screens/map.js:11 +MapScreen
## src/ui/screens/marcianos.js (116L)
src/ui/screens/marcianos.js:11 KEYS
src/ui/screens/marcianos.js:12 WAIT
src/ui/screens/marcianos.js:14 +MarcianosScreen
## src/ui/screens/menu.js (113L)
src/ui/screens/menu.js:10 Diorama
src/ui/screens/menu.js:78 +MenuScreen
## src/ui/screens/mini-grid.js (21L)
src/ui/screens/mini-grid.js:5 +MiniGrid
## src/ui/screens/minis.js (20L)
src/ui/screens/minis.js:7 +MinisScreen
## src/ui/screens/overlays.js (70L)
src/ui/screens/overlays.js:11 closeOnBackdrop
src/ui/screens/overlays.js:12 useEscape
src/ui/screens/overlays.js:18 +PauseOverlay
src/ui/screens/overlays.js:48 +HowToOverlay
## src/ui/screens/queens.js (43L)
src/ui/screens/queens.js:8 +QueensScreen
## src/ui/screens/scenario.js (37L)
src/ui/screens/scenario.js:8 RUN
src/ui/screens/scenario.js:9 noop
src/ui/screens/scenario.js:12 ScenarioScreen
src/ui/screens/scenario.js:20 screen
src/ui/screens/scenario.js:21 +CaceriaScreen
src/ui/screens/scenario.js:22 +BodyguardScreen
src/ui/screens/scenario.js:23 +GiantHuntScreen
src/ui/screens/scenario.js:24 +MinefieldScreen
src/ui/screens/scenario.js:25 +KingImpostorScreen
src/ui/screens/scenario.js:26 +EscapeScreen
src/ui/screens/scenario.js:27 +ContrabandScreen
src/ui/screens/scenario.js:28 +LaboratoryScreen
src/ui/screens/scenario.js:29 +CollapsingFloorScreen
src/ui/screens/scenario.js:30 +KnightScreen
src/ui/screens/scenario.js:31 +MatesScreen
src/ui/screens/scenario.js:32 +BlizzardScreen
src/ui/screens/scenario.js:33 +OutbreakScreen
src/ui/screens/scenario.js:34 +ClockScreen
src/ui/screens/scenario.js:35 +BlindScreen
src/ui/screens/scenario.js:36 +WitchScreen
## src/ui/screens/setup.js (145L)
src/ui/screens/setup.js:13 SIDES
src/ui/screens/setup.js:20 +RUN_MECHANICS
src/ui/screens/setup.js:21 PrefsCard
src/ui/screens/setup.js:43 +SetupScreen
src/ui/screens/setup.js:95 +SettingsScreen
## src/ui/screens/shop.js (142L)
src/ui/screens/shop.js:14 CARD_LIST
src/ui/screens/shop.js:16 +ShopScreen
## src/ui/screens/zen.js (572L)
src/ui/screens/zen.js:16 ETAPAS
src/ui/screens/zen.js:18 TOOLS
src/ui/screens/zen.js:25 TOOL_ART
src/ui/screens/zen.js:26 reduced
src/ui/screens/zen.js:27 later
src/ui/screens/zen.js:29 the
src/ui/screens/zen.js:30 cap
src/ui/screens/zen.js:32 ROOM
src/ui/screens/zen.js:33 SOIL_COLORS
src/ui/screens/zen.js:34 OUT
src/ui/screens/zen.js:38 potArt
src/ui/screens/zen.js:47 +ZenScreen
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
## src/ui/zen-art.js (244L)
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
src/ui/zen-art.js:227 +boardPond
src/ui/zen-art.js:232 +stoneArt
src/ui/zen-art.js:238 +ITEM_ART
src/ui/zen-art.js:243 +KOI_ART
## src/view/board-view.js (1019L)
src/view/board-view.js:12 +CAMERAS
src/view/board-view.js:13 JUMPERS
src/view/board-view.js:14 reduced
src/view/board-view.js:15 gooCount
src/view/board-view.js:16 wait
src/view/board-view.js:17 css
src/view/board-view.js:19 +collapseTiles
src/view/board-view.js:31 BADGES
src/view/board-view.js:39 +BoardView
## src/view/fx.js (140L)
src/view/fx.js:6 +Fx
## src/view/piece-art.js (129L)
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
src/view/piece-art.js:128 +artOf
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
## css/board.css (276L)
css/board.css:1 /* 3D tabletop: tilted board plane, tiles with thickness, cardb
css/board.css:26 /* Liquid base while a piece moves: drawn on the board plane ju
css/board.css:33 /* Tiles
css/board.css:49 /* Front face: the board is a slab of thick card, so exposed ed
css/board.css:58 /* Campo minado: lo tapado va en relieve como el buscaminas; lo
css/board.css:82 /* Card targeting: dashed brass outline on valid targets; previ
css/board.css:90 /* Casilla que la defensa de un minijuego captura (Yo, Zombi).
css/board.css:92 /* Terrain: ice is a pale frozen slab with cracks; portals are 
css/board.css:102 /* Pieces
css/board.css:106 /* Zombis de los minijuegos tipo PvZ: verde podrido, distinto d
css/board.css:108 /* Peón zombi de la Plaga: figura verde podrida, base del color
css/board.css:111 /* Contagiada: conserva el color de su bando nuevo y lleva un h
css/board.css:114 /* Posición de casillas y piezas: no se heredan. Heredadas, mov
css/board.css:131 /* Token base: three stacked discs give the coin its thickness;
css/board.css:143 /* Aiming a card: pieces it can be played on wear a dashed bras
css/board.css:162 /* En el set píxel las piezas botan un píxel justo, a saltos y 
css/board.css:165 /* El sprite ya trae contorno y la peana su sombra: sin drop-sh
css/board.css:168 /* Mientras caen las piezas al empezar, quietas: el bote de 32 
css/board.css:171 /* En el set píxel la peana también es de píxeles: disco escalo
css/board.css:183 /* Fog: an enemy far from your pieces is only a shape in the mi
css/board.css:196 /* Piece badges: lock = escorted, flag = falls last, star = bor
css/board.css:225 /* Etiqueta de casilla: ficha de papel con pico, encima de la c
css/board.css:240 /* Mesa Pixelada: el set de pxl. El PNG ya trae color y contorn
css/board.css:246 /* Fondos del tema píxel (art/temas/<tema>, variables puestas p
css/board.css:263 /* Estanque del centro abierto y coleccionables: tumbados sobre
## css/pixel.css (70L)
css/pixel.css:1 /* Modo píxel: con un tema píxel (data-art="pixel", ver src/dat
css/pixel.css:6 /* Jersey 10 (OFL), servida desde el juego: el subconjunto lati
css/pixel.css:20 /* Solo elementos: con ::before y ::after el navegador calculab
css/pixel.css:24 /* Los dibujos vectoriales (iconos, jardín, minijuegos) sin sua
css/pixel.css:28 /* Marcos del tema: el borde es la imagen cortada en nueve (esq
css/pixel.css:35 /* Botón de 8 bits: el marco tiene las esquinas en escalera y t
css/pixel.css:50 /* La fuente bitmap es más ancha: el nombre largo baja un punto
css/pixel.css:53 /* Tableros de los minijuegos: las mismas losas del tema que el
css/pixel.css:59 /* Jardín Zen: cada dibujo trae su sprite (zen-art.js) y aquí s
css/pixel.css:68 /* La moneda de cara o cruz, en escalones.
## css/screens.css (1310L)
css/screens.css:1 /* Screen layouts: menu, map, setup/settings, rewards, game HUD
css/screens.css:3 /* Curtain wipe between screens: the one authored transition of
css/screens.css:12 /* Menu: asymmetric, the diorama is the focal point and the tit
css/screens.css:17 /* Extras: the labelled pieces show the brass ring on hover and
css/screens.css:31 /* Title is extruded like the lid lettering of a board-game box
css/screens.css:56 /* Map: the run is a printed track on a game sheet.
css/screens.css:88 /* Mini-jefe: el rombo de latón. La ficha gira 45° y escala 0.7
css/screens.css:92 /* El troquel dice qué es el nodo: cuadrada y verde = minijuego
css/screens.css:105 /* Setup and settings
css/screens.css:109 /* En PC la mesa cabe sin desplazar: las mecánicas en su column
css/screens.css:151 /* Muestra de mesa en la tienda: damero de sus casillas sobre s
css/screens.css:166 /* Rewards
css/screens.css:169 /* Elegir premio: la carta tocada avanza y las otras se apagan 
css/screens.css:173 /* En teléfono no caben a lo ancho: abanico superpuesto sin scr
css/screens.css:186 /* Game: the board is the focal point, the HUD is a score sheet
css/screens.css:192 /* Organizar: barra de la fase previa, encima del tablero.
css/screens.css:202 /* Pellizco: el botón cuadrado devuelve el encuadre cuando hay 
css/screens.css:270 /* Hand of tactic cards: fanned in the bottom-left corner, like
css/screens.css:271 /* Its own strip under the board, so cards never cover pieces; 
css/screens.css:272 /* La carta de mano se dibuja siempre a 120px de ancho y el blo
css/screens.css:285 /* Rareza visible en la mano: la gema de la carta grande, en pe
css/screens.css:296 /* What the aimed card would do: a paper slip centred above the
css/screens.css:304 /* Foreground moments (src/ui/moments.js). Colour says who bene
css/screens.css:343 /* Piece demo: a small board with the usual reach (ink dots) an
css/screens.css:357 /* Callout tiers: major lands bigger, info reads small and ligh
css/screens.css:362 /* Trim the line box to cap height so big display text centres 
css/screens.css:379 /* Overlays
css/screens.css:385 /* Pausa: solo las mesas que tienes, en una tira que se desliza
css/screens.css:404 /* Rubber stamp: the result is "stamped" onto the score sheet.
css/screens.css:411 /* Animation lab (lab.html)
css/screens.css:421 /* El laboratorio también sirve en móvil: el menú pasa arriba y
css/screens.css:433 /* Minigames (src/ui/screens/connect4.js …): same table, same t
css/screens.css:435 /* El tablero mide su hueco real (cqw/cqh), como el tablero gra
css/screens.css:439 /* En la run el nivel lo fija el piso: se anuncia como dato, si
css/screens.css:441 /* Ayuda y nivel en un solo botón: las reglas y el selector viv
css/screens.css:448 /* Minijuegos con tablero vertical: en pantalla ancha el tabler
css/screens.css:455 /* El texto de turno cambia de largo: reservar dos líneas evita
css/screens.css:463 /* Cierre de minijuego: misma superficie que los tableros (gran
css/screens.css:470 /* Onboarding de Yo, Zombi: el paso activo queda encendido y lo
css/screens.css:487 /* The hole: a dark well cut into the board, so tokens read as 
css/screens.css:494 /* La ficha fantasma asoma en la casilla donde caería tu próxim
css/screens.css:498 /* La ficha cuadrada del minijuego, versión lista: misma forma 
css/screens.css:500 /* Jardín Zen: un karesansui sobre la mesa. Marco de madera, ar
css/screens.css:508 /* El cantero arranca en 4×4 y crece hasta 8×8: la pantalla man
css/screens.css:534 /* Las plantas se mecen despacio, cada una a su ritmo (--d).
css/screens.css:537 /* Burbuja de necesidad, como en PvZ: gota si falta riego, tije
css/screens.css:550 /* Maceta con planta: anclada a su base, sombra de contacto en 
css/screens.css:558 /* Esmalte de la maceta y color de la flor por especie; la vací
css/screens.css:582 /* Estanque: orilla de musgo, agua con hondura, koi, nenúfares,
css/screens.css:602 /* Musgo, pisadera y farol.
css/screens.css:613 /* Piedras de la tierra nueva: canto rodado con la cara al sol 
css/screens.css:621 /* La rama de arce asoma por la esquina y suelta, muy de vez en
css/screens.css:630 /* Hojas caídas sobre la arena: se tocan para barrerlas.
css/screens.css:635 /* Asa de las animaciones de la planta: escala desde donde nace
css/screens.css:637 /* Tierra húmeda tras regar, hasta que la flor abre.
css/screens.css:639 /* La regadera aparece sobre la maceta, se inclina, riega y se 
css/screens.css:651 /* El chorro sale del pico mientras la regadera está inclinada;
css/screens.css:656 /* Herramientas: dibujo común.
css/screens.css:666 /* La mano: la herramienta elegida acompaña al ratón sobre el j
css/screens.css:676 /* El gesto al tocar: las tijeras bajan al tallo y cortan dos v
css/screens.css:692 /* Mariposa: vuela hasta la flor, bate las alas y se posa.
css/screens.css:702 /* Alimento de los koi: bolitas que flotan hasta que se las com
css/screens.css:704 /* Estado del jardín: una línea tranquila bajo el cantero.
css/screens.css:706 /* Panel: sobres de semillas, herramientas con mango redondo, a
css/screens.css:717 /* El sobre va cerrado arriba con la costura en zigzag de los s
css/screens.css:736 /* Ampliar: barra con precio y confirmación; al armarse se pint
css/screens.css:748 /* Tierra virgen de los anillos: se cava para hacer un tiesto; 
css/screens.css:749 /* Tierra virgen de los anillos: arena sin rastrillar, más oscu
css/screens.css:751 /* La tierra sin cavar se marca siempre con su recuadro puntead
css/screens.css:756 /* Galería: grupos de imágenes; las bloqueadas son placeholders
css/screens.css:759 /* Celdas del mismo ancho: el nombre, corto o largo, no descuad
css/screens.css:770 /* Logros en la Galería: los mismos grupos que la pantalla de L
css/screens.css:773 /* Un jefe derrotado es un botón: su ficha de siempre, que al t
css/screens.css:783 /* Tienda del jardín: monedero, estantería y la marca de lo com
css/screens.css:786 /* Jardín Zen en pantalla ancha: el cantero ocupa la izquierda 
css/screens.css:792 /* En el teléfono la escena y el panel se apilan con su alto na
css/screens.css:804 /* Semillas en la tienda: la flor recortada sobre el verde del 
css/screens.css:819 /* Fila de tienda en teléfono: el nombre y la descripción ocupa
css/screens.css:832 /* Tienda en pantalla ancha: el catálogo de cartas a la izquier
css/screens.css:848 /* Logros: progreso total, grupos con barra y rejilla de fichas
css/screens.css:867 /* El logro que se tocó en la Galería destella al llegar.
css/screens.css:873 /* Aviso de logro: la ficha sube desde el borde inferior y se v
css/screens.css:896 /* La bomba del cañón enemigo lleva su color y un aro carmesí, 
css/screens.css:898 /* Puerta de salida, como la del NES: un portón de piedra que s
css/screens.css:904 /* Duelo: arena de papel con dos peanas en diagonal, como los c
css/screens.css:940 /* Fusión: bandeja de madera con huecos; cada ficha es una losa
css/screens.css:978 /* Tablero del Bomberman con cuerpo: la losa del cantero, celda
css/screens.css:986 /* El marco de losa: el mismo para el tablero de minijuego (Boa
css/screens.css:1005 /* La figura va SOBRE su peana: sin z-index la peana la tapaba 
css/screens.css:1018 /* En la fila del fondo la figura se contiene para que la cabez
css/screens.css:1033 /* Matamarcianos: la bola en vuelo, las vidas y el mando de dos
css/screens.css:1038 /* Tu fila, marcada: pisarla cuesta una vida.
css/screens.css:1045 /* Hockey de mesa: un tablero de 6×10 hace de mesa, la banda es
css/screens.css:1057 /* Rayas de la mesa: la central, el círculo de saque y el área 
css/screens.css:1066 /* Lo que se mueve: origen arriba a la izquierda y el script po
css/screens.css:1070 /* La peana es la huella que choca; la torre se alza sobre ella
css/screens.css:1081 /* Regla de los siete segundos: los tres últimos, el disco parp
css/screens.css:1089 /* La mesa es alta: en el teléfono el escenario le da más alto 
css/screens.css:1092 /* Píxel: losas del tema en las casillas y lo redondo, octógono
css/screens.css:1108 /* Peón levantado mientras se arrastra, y la casilla a la que i
css/screens.css:1112 /* La valla cae en su sitio con un golpe seco.
css/screens.css:1125 /* El aro de vida del tablero (pc-hp) a escala de casilla, dent
css/screens.css:1129 /* En pantallas bajas el tablero vale más que el chrome: menos 
css/screens.css:1131 /* En el teléfono la compra se aprieta a una fila de ficha y pr
css/screens.css:1137 /* Estado de los minis sobre la losa: ficha de monedas y contad
css/screens.css:1140 /* Contadores en fila: un punto por unidad; apagado queda lo ga
css/screens.css:1144 /* La última oleada es la horda: su punto es un banderín bermel
css/screens.css:1147 /* El número del carril en su esquina: es la tecla que lo lanza
css/screens.css:1149 /* La bolera es apaisada: su escenario no reserva el alto pensa
css/screens.css:1153 /* La línea roja del original: hasta ahí se lanza.
css/screens.css:1155 /* La ficha que rueda va como elemento para que Motion la pueda
css/screens.css:1156 /* La ficha es una pieza de damas vista en perspectiva: disco c
css/screens.css:1166 /* Cara o cruz: la misma ficha, de canto a cara; marfil por del
css/screens.css:1180 /* Avance de la oleada con el banderín de la horda al 70 %.
css/screens.css:1187 /* La cinta: las fichas que vienen, la primera se lanza al toca
css/screens.css:1199 /* Copias de un paso ya jugado: la pieza que cae y la ficha que
css/screens.css:1204 /* Selector de mecánicas de la run: favorita en latón, vetada t
css/screens.css:1213 /* Mobile-first repair: keep the game surface visible instead o
css/screens.css:1245 /* The animation lab must give its remaining viewport to the li
css/screens.css:1288 /* Mobile: floating sandwich button for minigame controls (lab 
## css/tokens.css (40L)
css/tokens.css:1 /* Design tokens. Reasons for each choice live in DESIGN.md.
