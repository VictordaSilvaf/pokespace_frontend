local item1, item2, item3 = 0, 0, 0

function init()
  connect(g_game, { onGameEnd = onGameEnd })
	  ProtocolGame.registerExtendedOpcode(111, function(protocol, opcode, buffer) showPortrais(buffer) closeChannel(buffer) end)
  deadWindow = g_ui.displayUI('memory')
  deadWindow:hide()
end

function terminate()
  disconnect(g_game, { onGameEnd = onGameEnd })

  deadWindow:destroy()
end

function onGameEnd()
  if deadWindow:isVisible() then
    deadWindow:hide()
  end
end

function show()
  deadWindow:show()
  deadWindow:raise()
  deadWindow:focus()
end

function showPortrais(strings)
  deadWindow:show()
  deadWindow:raise()
  deadWindow:focus()
  local args = string.explode(strings, '-')  
  
  if args[1] == "?" then
	 deadWindow:getChildById("dittoImgForm1"):setImageSource('/images/game/battle/dittoFormOff')
	 item1 = 3283
  else
     deadWindow:getChildById("dittoImgForm1"):setImageSource('/images/game/battle/dittoForm')
	 item1 = tonumber(args[1])
  end
  
  if args[2] == "?" then
	 deadWindow:getChildById("dittoImgForm2"):setImageSource('/images/game/battle/dittoFormOff')
	 item2 = 3283
  else
     deadWindow:getChildById("dittoImgForm2"):setImageSource('/images/game/battle/dittoForm')
	 item2 = tonumber(args[2])
  end
  
  if args[3] == "?" then
	 deadWindow:getChildById("dittoImgForm3"):setImageSource('/images/game/battle/dittoFormOff')
	 item3 = 3283
  else
     deadWindow:getChildById("dittoImgForm3"):setImageSource('/images/game/battle/dittoForm')
	 item3 = tonumber(args[3])
  end
  
	  deadWindow:getChildById('portrait1'):setItemId(item1)
	  deadWindow:getChildById('portrait2'):setItemId(item2)
	  deadWindow:getChildById('portrait3'):setItemId(item3)
end

function hide()
  deadWindow:hide()
end

function closeChannel(buffer)
  if buffer == "sair" then
     deadWindow:hide()
  end
end
 
function sendRequestShow()
   g_game.getProtocolGame():sendExtendedOpcode(111, "requestDittoMemory")
end

function saveOrUseMemory(memoryID) 
   if memoryID == 1 then
      if item1 == 3283 then
         g_game.getProtocolGame():sendExtendedOpcode(111, "saveMemory1")
	  else 
	     g_game.getProtocolGame():sendExtendedOpcode(111, "use1")
	  end
   elseif memoryID == 2 then
      if item2 == 3283 then
         g_game.getProtocolGame():sendExtendedOpcode(111, "saveMemory2")
	  else 
	     g_game.getProtocolGame():sendExtendedOpcode(111, "use2")
	  end
   elseif memoryID == 3 then
      if item3 == 3283 then
         g_game.getProtocolGame():sendExtendedOpcode(111, "saveMemory3")
	  else 
	     g_game.getProtocolGame():sendExtendedOpcode(111, "use3")
	  end
   end
end

function clearSlot(memoryID) 
   if memoryID == 1 then
      g_game.getProtocolGame():sendExtendedOpcode(111, "clearSlot1")
   elseif memoryID == 2 then
      g_game.getProtocolGame():sendExtendedOpcode(111, "clearSlot2")
   elseif memoryID == 3 then
      g_game.getProtocolGame():sendExtendedOpcode(111, "clearSlot3")
   end
end