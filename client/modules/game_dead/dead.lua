local charInfo = {}

function init()

	  ProtocolGame.registerExtendedOpcode(130, function(protocol, opcode, buffer) showNow(buffer) end)
  deadWindow = g_ui.displayUI('dead')
  deadWindow:hide()
end

function terminate()
end

function onGameEnd()
end

function show()
  deadWindow:show()
  deadWindow:raise()
  deadWindow:focus()
end

function showNow(buffer)
  deadWindow:show()
  deadWindow:raise()
  deadWindow:focus()
  local str = buffer:explode("|")
  deadWindow:getChildById('label'):setText('Você foi derrotado por "' .. str[2] .. '".')
  deadWindow:getChildById('label2'):setText('Você recebeu: ' .. str[3] .. ' de dano.')
  deadWindow:getChildById('portrait1'):setItemId(tonumber(str[4]))
  focusMe()
end

function focusMe()
	if deadWindow:isVisible()then
	   deadWindow:show()
	   deadWindow:raise()
	   deadWindow:focus()
	   scheduleEvent(focusMe, 100)
	end
end

function hide()
  deadWindow:hide()
end