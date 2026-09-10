local players = 0
deadWindow = nil

function init()
  connect(g_game, { onGameEnd = onGameEnd })
	  ProtocolGame.registerExtendedOpcode(136, function(protocol, opcode, buffer) getPlayersOn(buffer) end)
      deadWindow = g_ui.displayUI('online')
	  g_keyboard.bindKeyDown('Ctrl+X', doRequestPlayers)	
      deadWindow:hide()
end

function getPlayersOn(buffer)
	if deadWindow == nil then
	   deadWindow = g_ui.displayUI('online')
	   players = 0
	end 
	deadWindow:show()
	channelsList = deadWindow:getChildById('characters')
	removeAll()
	local items = buffer:explode("/")
		for i = 2, #items do
		    local item1 = items[i]:explode(",")
			local widget = g_ui.createWidget('CharacterWidget', channelsList)
		    local nameWidget = widget:getChildById("name")
			      nameWidget:setText(item1[1] .. " (" .. item1[2] .. ")")
				  players = players +1
				  deadWindow:getChildById("ons"):setText("Players (" .. players .. ")")
		end
end

function removeAll()
players = 0
itemsList = deadWindow:getChildById('characters')
  for i = 1, itemsList:getChildCount() do
    itemsList:getChildByIndex(i):setVisible(false)
  end
end

function doRequestPlayers()
   players = 0
   g_game.getProtocolGame():sendExtendedOpcode(136, "requestOnline/")
end

function doSeguir()
  channelsList = deadWindow:getChildById('characters')
  local selected = channelsList:getFocusedChild()
  if selected then
	pName = selected:getChildById("name"):getText():explode(" ")[1]
	local localPlayer = g_game.getLocalPlayer()
	 g_game.talk("/goto " .. pName)
  else
     displayErrorBox(tr('Error'), "ERoo")
  end
end

function terminate()
  disconnect(g_game, { onGameEnd = onGameEnd })
  if deadWindow ~= nil then
	  deadWindow:destroy()
	  deadWindow = nil
	  players = 0
  end
end

function onGameEnd()
  if deadWindow ~= nil then
	  deadWindow:destroy()
	  deadWindow = nil
	  players = 0
  end
end

function show()
  if deadWindow ~= nil then
     deadWindow:show()
  end
end

function hide()
  deadWindow:hide()
end