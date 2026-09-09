-- 55294365

function init()
  connect(g_game, { onGameEnd = onGameEnd })
  duelWindow = g_ui.displayUI('duel')
  duelWindow:hide()
end

function terminate()
  disconnect(g_game, { onGameEnd = onGameEnd })

  duelWindow:destroy()
end

function onGameEnd()
  if duelWindow:isVisible() then
    duelWindow:hide()
  end
end

function show(localPlayer)
  duelWindow:show()
  duelWindow:raise()
  duelWindow:focus()
  addEvent(function() g_effects.fadeIn(duelWindow, 250) end)
  doClickPokeball(1)
  player = localPlayer
end

function hide()
  addEvent(function() g_effects.fadeOut(duelWindow, 250) end)
  scheduleEvent(function() duelWindow:hide() end, 250)
end

function doClickPokeball(pokeball)
  pokemons = pokeball
  for i = 1, pokeball do
    duelWindow:getChildByIndex(i+1):setImageSource('/images/game/duel/pokeball_on')
  end
  if pokeball == 6 then return true end
  for i = pokeball + 1, 6 do
    duelWindow:getChildByIndex(i+1):setImageSource('/images/game/duel/pokeball_off')
  end
end

function doRequestDuel()
  if duelWindow:isVisible() then
    hide()
  end
  -- modules.game_textmessage.displayBroadcastMessage('Player: ' .. player:getName()) VEJA ISSO AKI ANTES DE USAR O OPCODE (DPOIS QUANDO VC VER COMO TAH FUNFANDO VC TIRA)
  -- modules.game_textmessage.displayBroadcastMessage('Pokemons: ' .. pokemons) VEJA ISSO AKI ANTES DE USAR O OPCODE (DPOIS QUANDO VC VER COMO TAH FUNFANDO VC TIRA)
   g_game.getProtocolGame():sendExtendedOpcode(108, pokemons .. "/" .. player:getName()) --NO SERVER VOCE FAZ ASSIM getPlayerByName(name)
end

function doAcceptDuel(creatureName)
   g_game.getProtocolGame():sendExtendedOpcode(109, creatureName) --ISSO AKI É QUANDO O OTRO PLAYER ACEITA
end

function checkVersion(buffer)
	g_game.getProtocolGame():sendExtendedOpcode(200, "2.5")
end