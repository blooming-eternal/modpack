// const EXILED_PEARL_ID = 'minecraft:ender_eye'

// function getData(item) {
// 	let itemData = item.get('minecraft:custom_data')
// 	if (itemData) {
// 		return eval(`(${itemData.toString()})`)
// 	}
// }

// ItemEvents.tooltip(event => {
// 	event.addAdvanced(EXILED_PEARL_ID, (item, _, text) => {
// 		let itemData = getData(item)
// 		if (itemData?.ExiledUUID) {
// 			if (!event.shift) {
// 				text.add(1, Text.gold('Right click to release the player.'));
// 				text.add(2, [Text.green('Shift + Right Click'), Text.of(' to add more exile time via specific fuel items.')]);
// 				text.add(3, [Text.green('Shift'), Text.of(' to see fuel items')]);
// 			} else {
// 				text.add(1, [Text.aqua('Echo Shards'), Text.of(' add'), Text.aqua('5 hours.')])
// 				text.add(1, [Text.aqua('Ghast Tears'), Text.of(' add'), Text.aqua('1 hours.')])
// 			}
// 		}
// 	})
// });
