const PLAINSLIKE = ['minecraft:plains', 'sunflower_plains']
const JUNGLES = ['minecraft:jungle', 'minecraft:sparse_jungle', 'minecraft:bamboo_jungle']
const SAVANNA = ['minecraft:savanna', 'minecraft:savanna_plateau']
const SWAMP = ['minecraft:swamp', 'minecraft:mangrove_swamp']
const TAIGA = ['minecraft:taiga', 'minecraft:old_growth_pine_taiga', 'minecraft:old_growth_spruce_taiga']
const FORESTS = ['minecraft:forest', 'minecraft:flower_forest', 'minecraft:birch_forest', 'minecraft:old_growth_birch_forest']
const WINDSWEPT = ['minecraft:windswept_forest', 'minecraft:windswept_hills']

const CROPS = {
    'minecraft:sugar_cane': ['minecraft:river', 'minecraft:beach'].concat(PLAINSLIKE, FORESTS),
    'minecraft:wheat_seeds': PLAINSLIKE.concat(SAVANNA),
    'minecraft:cocoa_beans': JUNGLES,
    'minecraft:pumpkin_seeds': PLAINSLIKE.concat(FORESTS),
    'minecraft:melon_seeds': JUNGLES.concat(SAVANNA),
    'minecraft:beetroot_seeds': ['minecraft:meadow'].concat(PLAINSLIKE, TAIGA),
    'minecraft:nether_wart': ['minecraft:nether_wastes', 'minecraft:soul_sand_valley', 'minecraft:crimson_forest', 'minecraft:warped_forest', 'minecraft:basalt_deltas'],
    'minecraft:carrot': ['minecraft:meadow'].concat(WINDSWEPT, TAIGA),
    'minecraft:potato': PLAINSLIKE.concat(TAIGA, FORESTS, WINDSWEPT),
    'minecraft:bamboo': JUNGLES,
    'farmersdelight:cabbage_seeds': ['minecraft:meadow'].concat(TAIGA),
    'farmersdelight:tomato_seeds': PLAINSLIKE.concat(FORESTS)
}

BlockEvents.placed(event => {
    let biomeId
    try {
        let biomeKey = event.level.getBiome(event.player.position())
        if (biomeKey.isBound()) {
            biomeId = biomeKey.unwrapKey().get().location().toString()
        } else {
            return
        }
    } catch (e) {
        return
    }

    let biomes = CROPS[event.player.inventory.getItem(event.player.inventory.selected).id]
    if(biomes && !biomes.includes(biomeId)) {
        event.player.tell(`§cThis crop cannot be planted in this climate. These are the acceptable biomes: ${biomes.join(', ')}`)
        event.cancel()
    }
})
