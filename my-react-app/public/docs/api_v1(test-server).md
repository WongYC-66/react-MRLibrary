# API v1 Documentation

### Equip
- [`GET /api/v1/equip?id=1302000`](https://test-royals-library.netlify.app/api/v1/equip?id=1302000)   : Get 1 equip detailed info
- [`GET /api/v1/equip`](https://test-royals-library.netlify.app/api/v1/equip)               : Get paginated Equips
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/equip?page=1&overallcategory=weapon&job=0&category=dagger&order=reqLevel&sort=ascending&cosmetic=null&search=maple`

        - page = integer (default: 1)
        - overallcategory = ['any', 'weapon', 'hat', 'top', 'bottom', 'overall', 'shoes', 'gloves', 'cape', 'shield', 'faceacc', 'eyeacc', 'earring', 'ring', 'pendant', 'belt', 'medal']
        - category = ['any', 'OHSword', 'OHAxe', 'OHMace', 'dagger', 'wand', 'staff', 'THSword', 'THAxe', 'THMace', 'spear', 'polearm', 'bow', 'crossbow', 'claw', 'knuckle', 'gun', 'cash']   
            **Note**: Only applies to weapons
        - job = ['0', '1', '2', '4', '8', '16', '-1'] 
            **Note**: ['any', 'warrior', 'magician', 'archer', 'thief', 'pirate', 'beginner']
        - order = ['id', 'reqLevel', 'incPAD', 'incMAD', 'attackSpeed', 'incSTR', 'incDEX', 'incINT', 'incLUK', 'incACC', 'incEVA', 'tuc', 'incSpeed', 'incJump', 'incMHP', 'incMMP', 'incPDD', 'incMDD']
        - sort = ['ascending', 'descending']
        - cosmetic = ['on', 'null']
        - search = any string
    </details>

### Item
- [`GET /api/v1/item?id=2000000`](https://test-royals-library.netlify.app/api/v1/item?id=2000000)     : Get 1 item detailed info
- [`GET /api/v1/item`](https://test-royals-library.netlify.app/api/v1/item/)               : Get paginated Items
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/item?page=1&overallcategory=use&filter=potion&order=id&sort=ascending&search=blue`

        - page = integer (default: 1)
        - overallcategory = ['any', 'use', 'setup', 'etc']
        - filter = ['any', 'scroll', 'potion', 'tp', 'morph', 'mastery', 'sack', 'mbook', 'other'] 
            **Note**: for USE-only
        - order = ['id', 'hp', 'hpR', 'mp', 'mpR', 'pad','mad', 'acc', 'incPAD', 'incMAD', 'incACC', 'incMHP', 'incSTR', 'incDEX', 'incINT', 'incLUK', 'incSpeed', 'incJump'] 
            **Note**: for USE-only
        - sort = ['ascending', 'descending']
        - search = any string
    </details>

### Map
- [`GET /api/v1/map?id=104040000`](https://test-royals-library.netlify.app/api/v1/map?id=104040000)    : Get 1 map detailed info
- [`GET /api/v1/map`](https://test-royals-library.netlify.app/api/v1/map)                  : Get paginated Items
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/map?page=1&location=VictoriaIsland&search=hunting`

        - page = integer (default: 1)
        - location = ['any', "Amoria", "Aquarium", "Ariant", "AriantPQ","Boat", "CPQ", "CPQ2", "China", "Dojo", "EPQ", "EasternChina", "ElNath", "EllinForest", "Events", "FlorinaBeach", "GM", "GPQ", "HauntedHouse", "HerbTown", "KoreanFolkTown", "LHC", "LMPQ", "LPQ", "Leafre", "Ludibrium", "Magatia", "Malaysia", "MapleIsland", "MuLung", "NewLeafCity", "OPQ", "OmegaSector", "Orbis", "Others", "PPQ", "PhantomForest/CWK", "RJPQ", "Singapore", "Sleepywood", "TempleOfTime", "Thailand", "VictoriaIsland", "Zakum", "Zipangu"] 
        - search = any string
    </details>

### Monster
- [`GET /api/v1/monster?id=100100`](https://test-royals-library.netlify.app/api/v1/monster?id=100100)    : Get 1 monster detailed info
- [`GET /api/v1/monster`](https://test-royals-library.netlify.app/api/v1/monster)             : Get paginated Items
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/monster?page=1&filter=any&category=victoriaisland&order=level&sort=ascending&search=mushroom`

        - page = integer (default: 1)
        - filter = ['any', 'monster', 'boss']
        - category = refer to Map's Location params
        - order = ['id', 'level', 'exp', 'maxHP']
        - sort = ['ascending', 'descending']
        - search = any string
    </details>

### Music
- [`GET /api/v1/music?name=amoria`](https://test-royals-library.netlify.app/api/v1/music?name=amoria)    : Get 1 music detailed info
- [`GET /api/v1/music`](https://test-royals-library.netlify.app/api/v1/music)                : Get paginated Musics
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/music?page=1&search=amoria`

        - page = integer (default: 1)
        - search = any string
    </details>

### Npc
- [`GET /api/v1/npc?id=2002`](https://test-royals-library.netlify.app/api/v1/npc?id=2002)          : Get 1 npc info
- [`GET /api/v1/npc`](https://test-royals-library.netlify.app/api/v1/npc)                  : Get paginated NPCs
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/npc?page=1&location=victoria-island&type=all&search=instructor`

        - page = integer (default: 1)
        - location = ['all', 'amoria', 'ellin', 'maple-island', 'masteria', 'ossyria', 'victoria-island', 'world-tour', 'other']
        - type = ['beauty', 'crafter', 'job', 'merchant', 'pet', 'storage', 'transport', 'wedding', 'other']
        - search = any string
    </details>

### Quest
- [`GET /api/v1/quest?id=2017`](https://test-royals-library.netlify.app/api/v1/quest?id=2017)        : Get 1 quest info
- [`GET /api/v1/quest`](https://test-royals-library.netlify.app/api/v1/quest)                : Get paginated Quests
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/quest?page=1&location=victoria&type=all&search=arwen`
        
        - page = integer (default: 1)
        - location = ['all', 'job', 'maple-island', 'victoria', 'elnath', 'ludus', 'ellin', 'leafre', 'neo-tokyo', 'mulung', 'masteria', 'temple', 'party', 'world', 'malaysia', 'event', 'title', 'zakum' ,'hero']
        - search = any string
    </details>

### Skill
- [`GET /api/v1/skill?id=1001004`](https://test-royals-library.netlify.app/api/v1/skill?id=1001004)     : Get 1 skill info
- [`GET /api/v1/skill`](https://test-royals-library.netlify.app/api/v1/skill)                : Get paginated Skills
    <details>
        <summary> optional params </summary>

        - e.g. `GET /api/v1/skill?page=1&filter=mm&order=id&sort=ascending&search=crossbow`
        
        - page = integer (default: 1)
        - filter = ['any', 'beginner', 'special', 'swordman', 'hero', 'pal', 'dk', 'magician', 'fp', 'il', 'bishop', 'archer', 'bm', 'mm', 'rogue', 'nl', 'shad'. 'pirate', 'bucc', 'sair']
        - order = ['id']
        - sort = ['ascending', 'descending']
        - search = any string
    </details>

---

- current pagination = 50 items per page
- paginated data not detailed, but as much as what you see in unofficial-library page
- optional query params, if not labelled, please refer to dropdown option at unofficial-library