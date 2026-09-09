pokedexWindow = nil

function init()
  connect(g_game, { onGameEnd = hide })

  ProtocolGame.registerExtendedOpcode(100, function(protocol, opcode, buffer) onUsePokedex(protocol, opcode, buffer) end)
  ProtocolGame.registerExtendedOpcode(101, function(protocol, opcode, buffer) doCreatePokedex(protocol, opcode, buffer) end)
  ProtocolGame.registerExtendedOpcode(1002, function(protocol, opcode, buffer) doCreatePokedex(protocol, opcode, buffer) end)
end

function terminate()
  disconnect(g_game, { onGameEnd = hide })

  ProtocolGame.unregisterExtendedOpcode(100)
  ProtocolGame.unregisterExtendedOpcode(101)

  hide()
end

function show()
  pokedexWindow = g_ui.displayUI('pokedex')
  pokemonImage = pokedexWindow:getChildById('pokemonImage')
  pokemonType1 = pokemonImage:getChildById('pokemonType1')
  pokemonType2 = pokemonImage:getChildById('pokemonType2')
  pokemonSearch = pokedexWindow:getChildById('searchText')
  pokedexTabBar = pokedexWindow:getChildById('pokedexTabBar')
  pokedexListPanel = pokedexWindow:getChildById('pokedexList')

  pokemonSearch:focus()
  pokedexTabBar:setContentWidget(pokedexWindow:getChildById('pokedexTabContent'))

  infoPanel = g_ui.loadUI('info')
  pokemonInfo = infoPanel:getChildById('pokemonInfo')
  pokedexTabBar:addTab('Information', infoPanel)

  movesPanel = g_ui.loadUI('moves')
  pokemonMoves = movesPanel:getChildById('pokemonMoves')
  pokedexTabBar:addTab('Moves', movesPanel)

  statsPanel = g_ui.loadUI('stats')
  pokemonStatsAttack = statsPanel:getChildById('pokemonStatsAttackPercent')
  pokemonStatsDefense = statsPanel:getChildById('pokemonStatsDefensePercent')
  pokemonStatsSpAttack = statsPanel:getChildById('pokemonStatsSpAttackPercent')
  pokemonStatsVitality = statsPanel:getChildById('pokemonStatsVitalityPercent')
  pokedexTabBar:addTab('Stats', statsPanel)

  effectivenessPanel = g_ui.loadUI('effectiveness')
  pokemonEffectiveness = effectivenessPanel:getChildById('pokemonEffectiveness')
  pokedexTabBar:addTab('Effectiveness', effectivenessPanel)
end

function hide()
  if pokedexWindow then
    g_keyboard.unbindKeyPress('Down')
    g_keyboard.unbindKeyPress('Up')
    pokedexWindow:destroy()
    pokedexWindow = nil
  end
end

function searchPokemon()
  local searchFilter = pokemonSearch:getText():lower()

  for i = 1, pokedexListPanel:getChildCount() do
    local pokemon = pokedexListPanel:getChildByIndex(i)

    local searchCondition = (searchFilter == '') or (searchFilter ~= '' and string.find(pokemon:getText():lower(), searchFilter) ~= nil)
    pokemon:setVisible(searchCondition)
  end
end

function doCreatePokedex(protocol, opcode, buffer)
  if pokedexWindow then return end
  show()
  g_keyboard.bindKeyPress('Down', function() pokedexListPanel:focusNextChild(KeyboardFocusReason) end, pokedexWindow)
  g_keyboard.bindKeyPress('Up', function() pokedexListPanel:focusPreviousChild(KeyboardFocusReason) end, pokedexWindow)
  for pokeId = 1, 151 do
    pokemon = g_ui.createWidget('PokedexListLabel', pokedexListPanel)
    pokemon.pokeId = pokeId
    pokemon.pokeName = string.explode(string.explode(string.explode(buffer, ';')[pokeId], ' - ')[3], '|')[1]
    pokemon.onFocusChange = function()
      local focused = pokedexListPanel:getFocusedChild()
      if focused.pokeName == '??????' then
        removeEvent(event)
        doChangePokedexInfo()
      else
        removeEvent(event)
        event = scheduleEvent(function()  end, 250)
      end
    end
    if pokemon.pokeCatch and pokemon.pokeName ~= '??????' then
      pokemon:setIconColor('white')
    end
  end
end

function onUsePokedex(protocol, opcode, buffer)
  if g_game.getLocalPlayer():getName() == buffer then
    if pokedexListPanel:getChildByIndex(1).pokeName == '??????' then
      doChangePokedexInfo()
    else
      doChangePokedexInfo('Bulbasaur', 1, 20, 'A strange seed was planted on its back at birth. The plant sprouts and grows with this pokemon.', 30, 30, 65, 50, 'grass', 'poison')
    end
  else
    local pokeId = tonumber(string.explode(buffer, '|')[1])
    local pokeName = string.explode(buffer, '|')[2]
    local pokeLevel = string.explode(buffer, '|')[3]
    local pokeCatch = toboolean(string.explode(buffer, '|')[4])
    local pokeDesc = string.explode(buffer, '|')[5]
    local pokeAttack = string.explode(buffer, '|')[6]
    local pokeDefense = string.explode(buffer, '|')[7]
    local pokeSpAttack = string.explode(buffer, '|')[8]
    local pokeVitality = string.explode(buffer, '|')[9]
    local pokeType1 = string.find(string.explode(buffer, '|')[10], '/') and string.explode(string.explode(buffer, '|')[10], '/')[1] or string.explode(buffer, '|')[10]
    local pokeType2 = string.find(string.explode(buffer, '|')[10], '/') and string.explode(string.explode(buffer, '|')[10], '/')[2] or nil
    if string.find(pokedexListPanel:getChildByIndex(pokeId).pokeName, '??????') then
      pokedexListPanel:getChildByIndex(pokeId):setText(((pokeId > 9 and pokeId < 100) and "#0" or (pokeId < 10) and "#00" or "#")..pokeId.." - "..pokeName)
      pokedexListPanel:getChildByIndex(pokeId).pokeId = pokeId
      pokedexListPanel:getChildByIndex(pokeId).pokeName = pokeName
      pokedexListPanel:getChildByIndex(pokeId).pokeLevel = pokeLevel
      pokedexListPanel:getChildByIndex(pokeId).pokeCatch = pokeCatch
      pokedexListPanel:getChildByIndex(pokeId).pokeDesc = pokeDesc
      pokedexListPanel:getChildByIndex(pokeId).pokeAttack = pokeAttack
      pokedexListPanel:getChildByIndex(pokeId).pokeDefense = pokeDefense
      pokedexListPanel:getChildByIndex(pokeId).pokeSpAttack = pokeSpAttack
      pokedexListPanel:getChildByIndex(pokeId).pokeVitality = pokeVitality
      pokedexListPanel:getChildByIndex(pokeId).pokeType1 = pokeType1
      pokedexListPanel:getChildByIndex(pokeId).pokeType2 = pokeType2
      if pokedexListPanel:getChildByIndex(pokeId).pokeCatch then
        pokedexListPanel:getChildByIndex(pokeId):setIconColor('white')
      end
    end
    doChangePokedexInfo(pokeName, pokeId, pokeLevel, pokeDesc, pokeAttack, pokeDefense, pokeSpAttack, pokeVitality, pokeType1, pokeType2)
  end
end

function doChangePokedexInfo(name, id, level, description, attack, defense, spattack, vitality, type1, type2)
  local name = name or 'none'
  local id = id or pokedexListPanel:getFocusedChild() and pokedexListPanel:getFocusedChild().pokeId or 1
  if name == 'none' then
    infoPanel:setVisible(false)
    statsPanel:setVisible(false)
    pokemonType1:setImageColor('alpha')
    pokemonType1:removeTooltip()
    pokemonType2:setImageColor('alpha')
    pokemonType2:removeTooltip()
    pokedexListPanel:getChildByIndex(id):focus()
  else
    infoPanel:setVisible(true)
    statsPanel:setVisible(true)
    pokemonType1:setImageColor('white')
    pokemonType1:setImageSource('/images/game/pokedex/elements/' .. type1)
    pokemonType1:setTooltip(doCorrectString(type1))
    if type2 and type2 ~= nil then
      pokemonType2:setImageColor('white')
      pokemonType2:setImageSource('/images/game/pokedex/elements/' .. type2)
      pokemonType2:setTooltip(doCorrectString(type2))
    else
      pokemonType2:setImageColor('alpha')
      pokemonType2:removeTooltip()
    end
    local str = {}
    table.insert(str, 'Name: ' .. name)
    table.insert(str, '\nLevel: ' .. level)
    table.insert(str, '\n\nDescription: ' .. description)
    pokemonInfo:setText(table.concat(str))
    pokemonStatsAttack:setValue(attack, 0, 255)
    pokemonStatsAttack:setText(attack)
    pokemonStatsDefense:setValue(defense, 0, 255)
    pokemonStatsDefense:setText(defense)
    pokemonStatsSpAttack:setValue(spattack, 0, 255)
    pokemonStatsSpAttack:setText(spattack)
    pokemonStatsVitality:setValue(vitality, 0, 255)
    pokemonStatsVitality:setText(vitality)
    pokedexListPanel:getChildByIndex(id):focus()
  end
  pokemonImage:setImageSource('/images/game/pokedex/' .. name)
end
