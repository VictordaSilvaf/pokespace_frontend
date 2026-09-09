function init()
  connect(g_game, { onGameEnd = onGameEnd })
  ProtocolGame.registerExtendedOpcode(105, function(protocol, opcode, buffer)
  local strings = string.explode(buffer, '-')  

  show(strings[1], strings[2], strings[3], strings[4], strings[5], strings[6], strings[7], strings[8], strings[9], strings[10], strings[11], strings[12], strings[13], strings[14], strings[15], strings[16], strings[17], strings[18], strings[19]) 
  end)

  catchWindow = g_ui.displayUI('catch')
  catchWindow:hide()
end

function terminate()
  disconnect(g_game, { onGameEnd = onGameEnd })
  ProtocolGame.unregisterExtendedOpcode(105)

  catchWindow:destroy()
end

function onGameEnd()
  if catchWindow:isVisible() then
    catchWindow:hide()
  end
end

function show(itemID, exp, pokemon, n, g, s, u, s2, magu, sora, yume, dusk, tale, moon, net, premier, tinker, fast, heavy)
  if not catchWindow:isVisible() then
    addEvent(function() g_effects.fadeIn(catchWindow, 250) end)
  end
  catchWindow:show()
  catchWindow:raise()
  catchWindow:focus()
  catchWindow:getChildById('portrait'):setItemId(tonumber(itemID))
  catchWindow:getChildById('pokeball'):setItemId(3282)
  catchWindow:getChildById('greatball'):setItemId(3279)
  catchWindow:getChildById('superball'):setItemId(3281)
  catchWindow:getChildById('ultraball'):setItemId(3280)		
  catchWindow:getChildById('saffariball'):setItemId(11929)
  
  catchWindow:getChildById('maguBall'):setItemId(15324) 
  catchWindow:getChildById('soraBall'):setItemId(15325)  
  catchWindow:getChildById('yumeBall'):setItemId(15326)  
  catchWindow:getChildById('duskBall'):setItemId(15327)  
  catchWindow:getChildById('taleBall'):setItemId(15330)  
  catchWindow:getChildById('moonBall'):setItemId(15331)  
  catchWindow:getChildById('netBall'):setItemId(15332)  
  catchWindow:getChildById('premierBall'):setItemId(15334)  
  catchWindow:getChildById('tinkerBall'):setItemId(15335)  
  catchWindow:getChildById('fastBall'):setItemId(15328)  
  catchWindow:getChildById('heavyBall'):setItemId(15329)  
  
  catchWindow:getChildById('text'):setText(tr('Congratulations, you caught a %s!\nXP: %s', doCorrectString(pokemon), exp))
  catchWindow:getChildById('pokeballsLabel'):setText(n)
  catchWindow:getChildById('greatballsLabel'):setText(g)
  catchWindow:getChildById('superballsLabel'):setText(s)
  catchWindow:getChildById('utraballsLabel'):setText(u)
  catchWindow:getChildById('saffariballsLabel'):setText(s2)
  
  catchWindow:getChildById('maguBallsLabel'):setText(magu)
  catchWindow:getChildById('soraBallsLabel'):setText(sora)
  catchWindow:getChildById('yumeBallsLabel'):setText(yume)
  catchWindow:getChildById('duskBallsLabel'):setText(dusk)
  catchWindow:getChildById('taleBallsLabel'):setText(tale)
  catchWindow:getChildById('moonBallsLabel'):setText(moon)
  catchWindow:getChildById('netBallsLabel'):setText(net)
  catchWindow:getChildById('premierBallsLabel'):setText(premier)
  catchWindow:getChildById('tinkerBallsLabel'):setText(tinker)
  catchWindow:getChildById('fastBallsLabel'):setText(fast)
  catchWindow:getChildById('heavyBallsLabel'):setText(heavy)
end

function hide()
  addEvent(function() g_effects.fadeOut(catchWindow, 250) end)
  scheduleEvent(function() catchWindow:hide() end, 250)
end
