local horas, mins, secs = 0, 0, 0
local channelName = ""
local playerChannelCreator = ""
local contagem = nil
local reset = false
local channelsList = nil
local password, playerPassName = "", ""
local users = 0

function init()
  connect(g_game, { onGameEnd = onGameEnd })
	  ProtocolGame.registerExtendedOpcode(125, function(protocol, opcode, buffer) doCountPlayer(buffer) closeChanneGravando(buffer) doRequestPassword(buffer) openCreate(buffer) doGravando(buffer) checkListChannels(buffer) end)
  deadWindow = g_ui.displayUI('tvcam')
  tvcamCreate = g_ui.displayUI('tvcamCreate')
  tvcamList = g_ui.displayUI('tvcamList')
  tvcamPassword = g_ui.displayUI('tvcamPassword')
  
  deadWindow:hide()
  tvcamCreate:hide()
  tvcamList:hide()
  tvcamPassword:hide()
end

function doCountPlayer(buffer)
	if buffer:find("add") then 
		users = users +1
	elseif buffer:find("remove") then 
		users = users -1
	end
end

function terminate()
  disconnect(g_game, { onGameEnd = onGameEnd })

  deadWindow:destroy()
  tvcamCreate:destroy()
  tvcamList:destroy()
  tvcamPassword:destroy()
end

function onGameEnd()
  deadWindow:destroy()
  tvcamCreate:destroy()
  tvcamList:destroy()
  tvcamPassword:destroy()
end

function show()
  deadWindow:show()
  deadWindow:raise()
  deadWindow:focus()
end

function hide(hidden)
	if hidden == 1 then
	   deadWindow:hide()
	   horas, mins, secs = 0, 0, 0
	   channelName = ""
	elseif hidden == 2 then
	   tvcamCreate:hide()
	elseif hidden == 3 then
	   tvcamList:hide()
	   channelsList = nil
	   tvcamList:destroy()
	   tvcamList = nil
	   playerChannelCreator = ""
	else
	   tvcamPassword:hide() 
	   password = ""
	   playerPassName = ""
	end
end

function openCreate(buffer)
   if buffer ~= "doCreate" then return true end
	  tvcamCreate = g_ui.displayUI('tvcamCreate')
	  tvcamCreate:show()
end

function doGravando(buffer)
	if not buffer:find("contar") then return true end
	hide(2)
	deadWindow = g_ui.displayUI('tvcam')
	local strings = buffer:explode(":")
	channelName = strings[2],
	deadWindow:getChildById("tvCamLabel"):setText("Gravando...")
	deadWindow:getChildById("tvCamNameLabel"):setText(channelName .. " - 00:00:00 (" .. users .. ")")
	deadWindow:getChildById("proximo"):setVisible(false)
	deadWindow:getChildById("anterior"):setVisible(false)
	deadWindow:show()
	reset = false
	countTime()
end

function doRquestTvCamCreate()
	local name, senha = tvcamCreate:getChildById('channelNameText'):getText(), tvcamCreate:getChildById('channelPasswordText'):getText()
	local useSenha = tvcamCreate:getChildById('usePassword'):isChecked()
	g_game.getProtocolGame():sendExtendedOpcode(125, "create/" .. name .. "/" .. (useSenha and senha or "notASSenha"))
end

function countTime()
	if reset then
	  removeEvent(contagem)
	  return true
	end
	secs = secs + 1
	if secs > 59 then 
	 mins = mins + 1
	 secs = 0 
	end
	
	if mins > 59 then
	   horas = horas + 1
	   mins = 0
	   secs = 0
	end
	deadWindow:getChildById("tvCamNameLabel"):setText(channelName .. " - " .. (horas < 10 and "0" .. horas or horas) .. ":" .. (mins < 10 and "0" .. mins or mins) .. ":" .. (secs < 10 and "0" .. secs or secs) .. " (" .. users .. ")")
	contagem = scheduleEvent(countTime, 1000)
end


function closeChanne()
	hide(1)
	horas, mins, secs = 0, 0, 0
	channelName = ""
	reset = true
	g_game.getProtocolGame():sendExtendedOpcode(125, "close/")
end

function closeChanneGravando(buffer)
	if not buffer:find("closeGraveando") then return true end
	hide(1)
	horas, mins, secs = 0, 0, 0
	channelName = ""
	reset = true
	g_game.getProtocolGame():sendExtendedOpcode(125, "close/")
end

function checkListChannels(buffer)
	if not buffer:find("openAllTVS|") then return true end
	tvcamList = g_ui.displayUI('tvcamList')
	channelsList = tvcamList:getChildById('characters')
	local channels = buffer:explode("|")
		for i = 2, #channels do
			if #channels[i]:explode("/") > 0 then 
				local widget = g_ui.createWidget('CharacterWidget', channelsList)
				local nameWidget = widget:getChildById("name")
					  nameWidget:setText(channels[i]:explode("/")[1] .. "/" .. channels[i]:explode("/")[2] .. "." )
					  if channels[i]:explode("/")[3] ~= "notASSenha" then
					     widget:getChildById("iconPass"):setVisible(true)
					  end
					  connect(widget, { onDoubleClick = function () hide(3) g_game.getProtocolGame():sendExtendedOpcode(125, "watch/" .. channels[i]:explode("/")[1]) return true end })
			end
		end
	tvcamList:show()
end

function doWatch()
  channelsList = tvcamList:getChildById('characters')
  local selected = channelsList:getFocusedChild()
  if selected then
	g_game.getProtocolGame():sendExtendedOpcode(125, "watch/" .. selected:getChildById("name"):getText():explode("/")[1])
  else
    displayErrorBox(tr('Error'), tr('Selecione um canal para assistir.'))
  end
  
  hide(3) 
end

function doRequestPassword(buffer)
	if not buffer:find("requestPass|") then return true end
	tvcamPassword = g_ui.displayUI('tvcamPassword')
	tvcamPassword:show()
	password = buffer:explode("|")[2]
	playerPassName = buffer:explode("|")[3]
end

function checkPasswords()
	if password == tvcamPassword:getChildById("channelPasswordText"):getText() then
	   g_game.getProtocolGame():sendExtendedOpcode(125, "watchWithPass/" .. playerPassName)
	else
	   g_game.getProtocolGame():sendExtendedOpcode(125, "errou")
	end
	hide(4)
end