myLootList = {}
lootWindow = nil
skillsButton = nil
function init()
  connect(g_game, { onGameEnd = onGameEnd })
  ProtocolGame.registerExtendedOpcode(135, function(protocol, opcode, buffer) showNow(buffer) end)
  
  skillsButton = modules.client_topmenu.addRightGameToggleButton('lootButton', tr('AutoLoot') .. ' (Ctrl+W)', '/images/topbuttons/loot', requestShow)
  skillsButton:setWidth(32)
  skillsButton:setOn(false)
  
  g_keyboard.bindKeyDown('Ctrl+W', requestShow)
  
end

function requestShow()
    if lootWindow ~= nil then return end
	g_game.getProtocolGame():sendExtendedOpcode(135, "load/")
	skillsButton:setOn(true)
end

function terminate()
   if lootWindow ~= nil then
	   skillsButton:destroy()
	   skillsButton = nil
	   lootWindow:destroy()	
	   lootWindow = nil
	   myLootList = {}
   end
end

function onGameEnd()
	if lootWindow == nil then return end
	   lootWindow:hide()	
end

function salvar()
   skillsButton:setOn(false)
   g_game.getProtocolGame():sendExtendedOpcode(135, "save/" .. table.concat(myLootList))
   lootWindow:destroy()	
   lootWindow = nil
   myLootList = {}
end

function colectAll()
   skillsButton:setOn(false)
   if lootWindow:getChildById('pegarAll'):isChecked() then
	  lootWindow:getChildById('pegarAll'):setChecked(false)
   else
       lootWindow:getChildById('pegarAll'):setChecked(true)
   end
   
   local conc = lootWindow:getChildById('pegarAll'):isChecked() == true and "all" or "no"
   g_game.getProtocolGame():sendExtendedOpcode(135, "save/" .. conc)
   lootWindow:destroy()	
   lootWindow = nil
   myLootList = {}
end

function showNow(buffer)
  lootWindow = g_ui.displayUI('loot')
  lootWindow:show()
  lootList = {}
  
  local tables = buffer:explode("|")
  local items = tables[2]:explode("/")
  local myList = tables[3]:explode("/")
  
  local collectAll = tables[1]:explode("*")
  if collectAll[1] == "yes" then
     lootWindow:getChildById('pegarAll'):setChecked(true)
  end
  
  
  
	channelsList = lootWindow:getChildById('characters')
	channelsList2 = lootWindow:getChildById('characters2')
		for i = 2, #items do
		local widget = g_ui.createWidget('CharacterWidget', channelsList)
		local item1 = items[i]:explode(",")
				local itemIDWidget = widget:getChildById("portrait1")
					  itemIDWidget:setItemId(tonumber(item1[1]))
					  
				local nameWidget = widget:getChildById("label2")
					  nameWidget:setText(item1[2])
					  
				local rareWidget = widget:getChildById("label3")
					  rareWidget:setText(item1[3])
		end
		
		for i = 2, #myList do
				local widget = g_ui.createWidget('CharacterWidget', channelsList2)
				local item1 = myList[i]:explode(",")
						local itemIDWidget = widget:getChildById("portrait1")
							  itemIDWidget:setItemId(tonumber(item1[1]))
							  
						local nameWidget = widget:getChildById("label2")
							  nameWidget:setText(item1[2])
							  table.insert(myLootList, item1[2] .. ",")
							  
						local rareWidget = widget:getChildById("label3")
							  rareWidget:setText(item1[3])
		end
		
	lootWindow:show()
end

function addToMyList()
   channelsList = lootWindow:getChildById('characters')
   channelsList2 = lootWindow:getChildById('characters2')
   local selected = channelsList:getFocusedChild()
   if selected then
   
	   if #myLootList > 0 then
	      for i = 1, #myLootList do
		      if myLootList[i]:explode(",")[1] == selected:getChildById("label2"):getText() then -- Item ja existe na lista de autoloot
			    displayErrorBox(tr('Error'), tr('Este item já está na sua lista.'))
			    return true
			  end
		  end
		end
		
		local widget = g_ui.createWidget('CharacterWidget', channelsList2)
				local itemIDWidget = widget:getChildById("portrait1")
					  itemIDWidget:setItemId(selected:getChildById("portrait1"):getItemId())
					  
				local nameWidget = widget:getChildById("label2")
					  nameWidget:setText(selected:getChildById("label2"):getText())
					  table.insert(myLootList, selected:getChildById("label2"):getText() .. ",")
					  
				local rareWidget = widget:getChildById("label3")
					  rareWidget:setText(selected:getChildById("label3"):getText())
  else
    displayErrorBox(tr('Error'), tr('Selecione um item primeiro.'))
  end
end

function removeItem()
   channelsList = lootWindow:getChildById('characters2')
   local selected = channelsList:getFocusedChild()
   if selected then
	  for i = 1, #myLootList do
		if myLootList[i]:explode(",")[1] == selected:getChildById("label2"):getText() then 
		   table.remove(myLootList, i)
		   selected:destroy()
		end
	  end
   else
    displayErrorBox(tr('Error'), tr('Selecione um item primeiro.'))
   end
end

function removeAllItems()
itemsList = lootWindow:getChildById('characters2')
  for i = 1, itemsList:getChildCount() do
    itemsList:getChildByIndex(i):setVisible(false)
  end
  myLootList = {}
end

function searchItem()
  itemSearch = lootWindow:getChildById("searchItemText")
  local searchFilter = itemSearch:getText():lower()
	    itemsList = lootWindow:getChildById('characters')
  for i = 1, itemsList:getChildCount() do
    local item = itemsList:getChildByIndex(i):getChildById("label2")

    local searchCondition = (searchFilter == '') or (searchFilter ~= '' and string.find(item:getText():lower(), searchFilter) ~= nil)
    itemsList:getChildByIndex(i):setVisible(searchCondition)
  end
end