import { useState, useEffect, useMemo } from "react"
import { decode } from "html-entities"
// 
import { renderImageWithMobId } from "../monster/utility"
// 
import data_worldMap from "../../../data/data_WorldMap.json"
import data_map from "../../../data/data_Map.json"

import data_MB_Maps from "../../../data/data_MB_Maps.json"
import data_MapMobCount from "../../../data/data_MapMobCount.json"

import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"

export default function WorldMap() {

    // FOR TOOLTIP
    const mapIdToMobList = useMemo(() => {
        let mapIdToMobs = {}

        // monsterbook from String.wz
        Object.entries(data_MB_Maps).forEach(([mobId, mapList]) => {
            mapList.forEach(mapId => {
                if (!mapIdToMobs[mapId]) mapIdToMobs[mapId] = new Set()
                if (!data_mobStats[mobId] || !data_mob[mobId]) return    // filter out weird mob
                mapIdToMobs[mapId].add(mobId)
            })
        })

        // from Map.wz
        Object.entries(data_MapMobCount).forEach(([mapId, mobCountObj]) => {
            if (!mapIdToMobs[mapId]) mapIdToMobs[mapId] = new Set()
            Object.keys(mobCountObj).forEach(mobId => {
                if (!data_mobStats[mobId] || !data_mob[mobId]) return    // filter out weird mob
                mapIdToMobs[mapId].add(mobId)
            })
        })
        return mapIdToMobs
    })

    // console.log(mapIdToMobList)

    return (
        <div className="world-map p-3 d-flex flex-wrap gap-4 justify-content-center">
            {/* {worldMapList.map(worldMapName => renderOriginalWorldMap(worldMapName))} */}
            {worldMapList.map((worldMapName) => renderLabelledlWorldMap(worldMapName, mapIdToMobList))}
        </div>

    )
}

const renderOriginalWorldMap = (worldMapName) => {
    return <img key={worldMapName} src={`/images/worldmaps/${worldMapName}.png`} width="100%"></img>
}

const renderLabelledlWorldMap = (worldMapName, mapIdToMobList) => {
    return <InteractiveWorldMap key={worldMapName} worldMapName={worldMapName} data={data_worldMap[worldMapName]} mapIdToMobList={mapIdToMobList} />
}

const worldMapList = [
    // "WorldMap",
    "WorldMap000",
    // "WorldMap010",
    // "WorldMap011",
    // "WorldMap012",
    // "WorldMap013",
    // "WorldMap014",
    // "WorldMap015",
    // "WorldMap016",
    // "WorldMap020",
    // "WorldMap021",
    // "WorldMap022",
    // "WorldMap030",
    // "WorldMap031",
    // "WorldMap032",
    // "WorldMap040",
    // "WorldMap050",
    // "WorldMap051",
    // "WorldMap060",
    // "WorldMap070",
    // "WorldMap080",
    // "WorldMap090",
    // "WorldMap091",
    // "WorldMap092",
    // "WorldMap093",
    // "WorldMap094",
    // "WorldMap140",
    // "WorldMap141",
    // "WorldMap142",
]

const InteractiveWorldMap = ({ worldMapName, data, mapIdToMobList }) => {
    // by chatGPT
    // console.log(worldMapName)
    // console.log(data)
    // console.log(mapIdToMobList)

    const [renderedMap, setRenderedMap] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, mapId: null, mapName: null });
    const [scale, setScale] = useState(1);

    const canvasWidth = Number(data.BaseImg['0'].width)
    const canvasHeight = Number(data.BaseImg['0'].height)
    const originX = Number(data.BaseImg['0'].origin.x)
    const originY = Number(data.BaseImg['0'].origin.y)
    const mapList = data.MapList;

    const formatted_mapList = Object.entries(mapList).map(([_, entry]) => {
        const x = Number(entry.spot.x) + originX;
        const y = Number(entry.spot.y) + originY;
        const mapId = Number(entry.mapNo['0'])
        // console.log(mapIdToMobList[mapId])
        return { x, y, mapId }
    })

    // Preload map image
    useEffect(() => {
        const img = new Image();
        img.src = `/images/worldmaps/${worldMapName}.png`; // Replace with your actual map path

        img.onload = () => {
            // Draw canvas
            const canvas = document.createElement('canvas');

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            for (const [_, entry] of Object.entries(mapList)) {
                const spotX = Number(entry.spot.x) + originX;
                const spotY = Number(entry.spot.y) + originY;
                const type = Number(entry.type)

                switch (type) {
                    case 0:
                        drawPoint(ctx, spotX, spotY, 8, 'blue') // town
                        break;
                    case 2:
                        drawPoint(ctx, spotX, spotY, 9, 'pink') // sub worldmap
                        break;
                    case 3:
                        drawPoint(ctx, spotX, spotY, 4.5, 'blue')   // sub-town
                        break;
                    case 1:
                    default:
                        drawPoint(ctx, spotX, spotY, 4, 'yellow')   // normap yellow point
                        break;
                }
            }

            // const url = canvas.toDataURL('image/png');
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                setRenderedMap(url);
            });
            // setRenderedMap(url);
        }
    }, []);

    useEffect(() => {
        const updateScale = () => {
            const maxWidth = window.innerWidth < 768 ? window.innerWidth - 40 : 1000;
            const newScale = Math.min(maxWidth / canvasWidth, 1);
            setScale(newScale);
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [canvasWidth]);

    const handleMouseEnter = (e, mapId) => {
        // console.log(mapId)
        if (!data_map[mapId]) return
        if (!mapIdToMobList[mapId]) return

        const containerRect = e.currentTarget.offsetParent.getBoundingClientRect();
        const targetRect = e.currentTarget.getBoundingClientRect();

        const mapName = decode(`${data_map[mapId].streetName} - ${data_map[mapId].mapName}`)

        setTooltip({
            visible: true,
            x: targetRect.left - containerRect.left + 20,
            y: targetRect.top - containerRect.top + 25,
            mapId,
            mapName,
        })
    }

    const handleMouseLeave = () => {
        setTooltip({ visible: false, x: 0, y: 0, mapId: null, mapName: null })
    }

    return (
        <div className="position-relative" style={{ width: canvasWidth * scale, height: canvasHeight * scale }}>
            {/* Labelled WorldMap */}
            <img src={renderedMap} width={canvasWidth * scale} height={canvasHeight * scale} alt={worldMapName}
                style={{ zIndex: 0 }}
            />

            {/* invisible Rect boxes with mouseover to show tooltip */}
            {formatted_mapList.map(({ x, y, mapId }) =>
                <div
                    key={x + "-" + y + "-" + mapId}
                    style={{
                        position: "absolute",
                        top: y * scale - 7.5 * scale,
                        left: x * scale - 7.5 * scale,
                        width: 15 * scale,
                        height: 15 * scale,
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, mapId)}
                    onMouseLeave={handleMouseLeave}
                />
            )}

            {/* tooltip */}
            {tooltip.visible && (
                <div className="position-fixed bg-white bg-opacity-75 rounded-2 p-2 text-black "
                    style={{
                        top: Math.min(tooltip.y, canvasHeight * scale - 100),
                        left: Math.min(tooltip.x, canvasWidth * scale - 200),
                        zIndex: 1000,
                        pointerEvents: "none"
                    }}>

                    {/* map name */}
                    <p className="fw-medium fs-6">{tooltip.mapName}</p>

                    {/* mob lists */}
                    {Array.from(mapIdToMobList[tooltip.mapId]).sort(sortById).map(mobId =>
                        <div key={tooltip.mapId + "-" + mobId} className="d-flex gap-2 align-items-center mb-1">
                            <div className="d-flex align-items-center" style={{ maxWidth: '50px', maxHeight: '50px' }}>{renderImageWithMobId(mobId)}</div>
                            <p>Lv: {data_mobStats[mobId].level}</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

function drawPoint(ctx, x, y, radius, color) {
    // Outer shadow
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Core circle with gradient depending on color
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    // Create gradient based on color parameter
    let gradient;
    switch (color) {
        case 'blue':
            gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
            gradient.addColorStop(0, '#cce7ff');
            gradient.addColorStop(0.5, '#3399ff');
            gradient.addColorStop(1, '#004080');
            break;
        case 'pink':
            gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
            gradient.addColorStop(0, '#ffd6e8');
            gradient.addColorStop(0.5, '#ff66b2');
            gradient.addColorStop(1, '#800040');
            break;
        case 'yellow':
        default:
            gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
            gradient.addColorStop(0, '#fff6b0');
            gradient.addColorStop(0.5, '#f8c100');
            gradient.addColorStop(1, '#b88700');
            break;
    }

    ctx.fillStyle = gradient;
    ctx.fill();
}

const sortById = (a, b) => {
    if (a.length != b.length) return a.length - b.length
    return Number(a) - Number(b)
}