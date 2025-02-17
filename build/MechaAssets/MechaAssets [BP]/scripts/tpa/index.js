import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import * as utils from "../libs/utils";
import * as menu from "../menu";
export function TpaUiForm(player, isMenu) {
    let form = new ActionFormData();
    form.title(`§l§cPlayer §2Teleport`);
    form.body(`§6Pilih player untuk target teleportasi.`);
    let players = utils.getPlayers();
    for (let targetPlayer of players) {
        const isOp = targetPlayer.isOp() ||
            targetPlayer.hasTag("paradoxOpped") ||
            targetPlayer.hasTag("admin") ||
            targetPlayer.hasTag("worldedit");
        const playerLocation = Object.values(targetPlayer.location)
            .map((v) => Math.round(v))
            .join(", ");
        form.button(`${targetPlayer.nameTag}\n${playerLocation}`, isOp ? "textures/ui/op" : "textures/ui/permissions_member_star");
    }
    form.show(player).then((result) => {
        if (isMenu && result.canceled)
            return menu.MenuForm(player);
        if (!result.canceled) {
            if (result.selection < players.length) {
                if (player.name == players[result.selection].name) {
                    player.sendMessage("§l§6[TPA] §r§cTidak bisa TP ke diri sendiri!");
                    player.playSound("note.bass");
                    return;
                }
                let tagPreviousTpa = player.getTags().filter((v) => v.includes("tpa:"));
                for (let playerTag of tagPreviousTpa) {
                    player.removeTag(playerTag);
                }
                players[result.selection].addTag("tpa_ui");
                players[result.selection].addTag("tpa:" + player.nameTag.replace(/ /g, "_"));
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l§6[TPA] §r§7Kamu telah mengirim permintaan TP ke §2${players[result.selection].nameTag}§7, mohon tunggu untuk disetujui.."}]}`);
            }
            else {
                player.sendMessage("§l§6[TPA] §r§cPlayer tidak valid!");
            }
        }
    });
}
export function TpaUI(player, fromPlayer) {
    let fromPlayerName = fromPlayer.replace(/_/g, " ");
    if (player.hasTag("paradoxOpped")) {
        player.sendMessage(fromPlayer + " Meminta TP ke " + player.nameTag);
    }
    new MessageFormData()
        .title(`§l§1Teleport Request`)
        .body(`§r§lKamu mendapat permintaan teleport dari §6${fromPlayerName}§r§l untuk pergi ke lokasimu, apakah kamu ingin menerimanya?`)
        .button1("§l§2Ya, tentu saja!")
        .button2("§l§cTidak, Biarkan saja.")
        .show(player)
        .then((result) => {
        if (result.canceled && result.cancelationReason == "userBusy") {
            // Sibuk
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l§6[TPA] §r§7Kamu mendapat permintaan teleport, ketik §a.tpaaccept ${fromPlayerName} §7atau §c.tpadeny ${fromPlayerName}"}]}`);
        }
        else if (!result.selection || result.cancelationReason == "userClosed") {
            // Tolak
            player.removeTag("tpa:" + fromPlayer);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l§6[TPA] §cPermintaan ditolak."}]}`);
            player.runCommandAsync(`tellraw "${fromPlayerName}" {"rawtext":[{"text":"§l§6[TPA] §cMaaf, ${player.nameTag} telah menolak permintaanmu!"}]}`);
        }
        else {
            // Terima
            player.removeTag("tpa:" + fromPlayer);
            player.runCommandAsync(`tp "${fromPlayerName}" @s`);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l§6[TPA] §aBerhasil teleportasi."}]}`);
            player.runCommandAsync(`tellraw "${fromPlayerName}" {"rawtext":[{"text":"§l§6[TPA] §aDiterima, berhasil teleportasi."}]}`);
            player.playSound("horn.call.1");
        }
    });
}
//# sourceMappingURL=index.js.map