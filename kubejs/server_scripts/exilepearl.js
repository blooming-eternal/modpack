const PEARL_ID = 'minecraft:ender_pearl'
const EXILED_PEARL_ID = 'minecraft:ender_eye'
const BASE_EXILE_DURATION = 1728000 // 1728000 ticks = 2 days (48 hours)

ServerEvents.loaded(event => {
	initExileStorage(event.server)
})

EntityEvents.death('player', event => {
	let playerToExile = event.entity
	let killer = event.source.player
	let server = event.server

	if (killer && killer.isPlayer()) {
		let slot = killer.inventory.findSlotMatchingItem(PEARL_ID)
		if (killer.inventory.isHotbarSlot(slot)) {
			let playerUUID = playerToExile.getUuid().toString()
			let playerName = playerToExile.username
			let captureData = {
				ExiledName: playerName,
				ExiledUUID: playerUUID
			}

			addExiles(server, playerUUID)

			let capturedPearl = Item.of(EXILED_PEARL_ID).set('minecraft:custom_data', captureData)
			.set('minecraft:custom_name', `§l${playerName}'s soul`)
			.set('minecraft:rarity', 'epic')

			let pearl = killer.inventory.getItem(slot)
			pearl.count = pearl.count - 1
			killer.inventory.add(capturedPearl)

			let exileDim = 'minecraft:the_nether'
			let exileX = 0
			// let exileY = 128
			let exileY = 194
			let exileZ = 0

			server.runCommandSilent(`execute in ${exileDim} run spawnpoint ${playerName} ${exileX} ${exileY} ${exileZ}`)
			killer.tell(Text.of(`§aYou have captured §c${playerName}§a in an Exile Pearl! They will stay jailed for 2 days, unless you fuel the exile pearl.`))
			playerToExile.tell(Text.of(`§cEXILED: You have been captured by §4${killer.username}§c! Your soul is bound to the Nether.`))
		}
	}
})

ItemEvents.rightClicked(event => {
	let { item, player, server } = event
	let itemData = getData(item)

	if (item.id == EXILED_PEARL_ID && itemData?.ExiledUUID) {
		if (player.isCrouching()) {
			let fuelItem = null
			
			if (fuelItem) {
				player.inventory.find(fuelItem).count--
				// TODO: update exile time
				player.tell(Text.of(`§aExile time extended by §e${timeExtText}§a using ${Text.of(fuelItem).string}.`))
			} else {
				// Inform user they need fuel and cancel the throw (since the intent was fueling)
				let timeExt1 = Math.round(FUEL_EXTENSION_TICKS_1 / 1200)
				let timeExt2 = Math.round(FUEL_EXTENSION_TICKS_2 / 1200 / 60)
				player.tell(Text.of(`§cYou have no fuel items for the exile pearl.`))
			}
		} else {
			handleRelease(server, item, player, false, itemData)
		}
		event.cancel()
	}
})

PlayerEvents.loggedIn(event => {
	let uuid = event.entity.getUuid().toString()
	let exileData = event.server.persistentData.offlineExiles[uuid]
	if(exileData) {
		handleRelease(event.server, undefined, undefined, true, {
			ExiledUUID: uuid,
			ExiledName: event.entity.username,
		})
	}
})

function handleRelease(server, pearl, player, isAutomatic, data) {
	let exiledUUID = data.ExiledUUID
	let exiledName = data.ExiledName

	removeExiles(server, exiledUUID)

	let exiledPlayer = server.getPlayers().find(p => p.getUuid().toString() === exiledUUID)
	if(player) {
		player.tell(Text.of(`§a${exiledName} has been released from exile.`))
	}

	if(pearl) {
		pearl.count = pearl.count - 1
	}

	if (isAutomatic) {
		exiledPlayer.tell(Text.of(`§aYour time is up, you have been freed from exile.`))
	} else {
		exiledPlayer.tell(Text.of(`§a${player.username ?? 'someone'} has freed you from exile.`))
	}
	
	if (exiledPlayer) {
		let releaseDim = data.ExileSpawnDimension || 'minecraft:overworld'

		let overworld = server.getLevel(releaseDim)
		let spawnPos = overworld.getSharedSpawnPos() 
		let releaseX = spawnPos.x
		let releaseY = spawnPos.y
		let releaseZ = spawnPos.z

		// let releaseX = data.ExileSpawnX
		// let releaseY = data.ExileSpawnY
		// let releaseZ = data.ExileSpawnZ

		server.runCommandSilent(`execute in ${releaseDim} run spawnpoint ${exiledName} ${releaseX} ${releaseY} ${releaseZ}`)
		server.runCommandSilent(`execute in ${releaseDim} run tp ${exiledName} ${releaseX} ${releaseY} ${releaseZ}`)
	} else {
		addExiles(server, data.ExiledUUID, true)
	}
}

function initExileStorage(server) {
	if(!server.persistentData.exiles) {
		server.persistentData.exiles = {}
	}

	if(!server.persistentData.offlineExiles) {
		server.persistentData.offlineExiles = {}
	}
}

function addExiles(server, uuid, offline) {
	let exileObj = {
		Timestamp: Date.now(),
		Duration: BASE_EXILE_DURATION
	}

	if(offline) {
		server.persistentData.offlineExiles[uuid] = exileObj
	} else {
		server.persistentData.exiles[uuid] = exileObj
	}
}

function removeExiles(server, uuid, offline) {
	delete server.persistentData.offlineExiles[uuid]
	delete server.persistentData.exiles[uuid]
} 

function getData(item) {
	let itemData = item.get('minecraft:custom_data')
	if (itemData) {
		return eval(`(${itemData.toString()})`)
	}
}
