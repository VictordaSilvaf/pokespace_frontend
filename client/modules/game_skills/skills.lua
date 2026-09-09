local badges = {
[1] = 'boulder_badge',
[2] = 'cascade_badge',
[3] = 'thunder_badge',
[4] = 'rainbow_badge',
[5] = 'marsh_badge',
[6] = 'soul_badge',
[7] = 'volcano_badge',
[8] = 'earth_badge',
}

skillsWindow = nil
skillsButton = nil

function init()
  connect(LocalPlayer, {
    onExperienceChange = onExperienceChange,
    onLevelChange = onLevelChange,
    onStaminaChange = onStaminaChange,
    onSkillChange = onSkillChange,
    onBaseSkillChange = onBaseSkillChange
  })
  ProtocolGame.registerExtendedOpcode(102, function(protocol, opcode, buffer) onPokemonSkillChange(protocol, opcode, buffer) end)

  connect(g_game, {
    onGameStart = refresh,
    onGameEnd = offline
  })

  skillsButton = modules.client_topmenu.addRightGameToggleButton('skillsButton', tr('Skills') .. ' (Ctrl+S)', '/images/topbuttons/skills', toggle)
  skillsButton:setWidth(35)
  skillsButton:setOn(true)
  skillsWindow = g_ui.loadUI('skills', modules.game_interface.getRightPanel())

  g_keyboard.bindKeyDown('Ctrl+S', toggle)

  refresh()
  skillsWindow:setup()
end

function terminate()
  disconnect(LocalPlayer, {
    onExperienceChange = onExperienceChange,
    onLevelChange = onLevelChange,
    onStaminaChange = onStaminaChange,
    onSkillChange = onSkillChange,
    onBaseSkillChange = onBaseSkillChange
  })
  ProtocolGame.unregisterExtendedOpcode(102)

  disconnect(g_game, {
    onGameStart = refresh,
    onGameEnd = offline
  })

  g_keyboard.unbindKeyDown('Ctrl+S')
  skillsWindow:destroy()
  skillsButton:destroy()
end

function expForLevel(level)
  return math.floor((50*level*level*level)/3 - 100*level*level + (850*level)/3 - 200)
end

function expToAdvance(currentLevel, currentExp)
  return expForLevel(currentLevel+1) - currentExp
end

function setSkillBase(id, value, baseValue)
  if baseValue <= 0 or value < 0 then
    return
  end
  local skill = skillsWindow:recursiveGetChildById(id)
  local widget = skill:getChildById('value')

  if value > baseValue then
    widget:setColor('#008b00') -- green
    skill:setTooltip(baseValue .. ' +' .. (value - baseValue))
  elseif value < baseValue then
    widget:setColor('#b22222') -- red
    skill:setTooltip(baseValue .. ' ' .. (value - baseValue))
  else
    widget:setColor('#bbbbbb') -- default
    skill:removeTooltip()
  end
end

function setSkillName(id, name)
  local skill = skillsWindow:recursiveGetChildById(id)
  local widget = skill:getChildById('name')
  widget:setText(name)
end

function setSkillValue(id, value)
  local skill = skillsWindow:recursiveGetChildById(id)
  local widget = skill:getChildById('value')
  widget:setText(value)
end

function setSkillPercent(id, percent, tooltip)
  local skill = skillsWindow:recursiveGetChildById(id)
  local widget = skill:getChildById('percent')
  widget:setPercent(math.floor(percent))

  if tooltip then
    widget:setTooltip(tooltip)
  end
end

function refresh()
  local player = g_game.getLocalPlayer()
  if not player then return end

  if expSpeedEvent then expSpeedEvent:cancel() end
  expSpeedEvent = cycleEvent(checkExpSpeed, 30*1000)

  onExperienceChange(player, player:getExperience())
  onLevelChange(player, player:getLevel(), player:getLevelPercent())
  onStaminaChange(player, player:getStamina())

  for i=0,6 do
    onSkillChange(player, i, player:getSkillLevel(i), player:getSkillLevelPercent(i))
    onBaseSkillChange(player, i, player:getSkillBaseLevel(i))
  end

  g_game.getProtocolGame():sendExtendedOpcode(102, 'refresh')

  skillsWindow:setContentMinimumHeight(50)
  skillsWindow:setContentMaximumHeight(330)
end

function offline()
  if expSpeedEvent then expSpeedEvent:cancel() expSpeedEvent = nil end
end

function toggle()
  if skillsButton:isOn() then
    skillsWindow:close()
    skillsButton:setOn(false)
  else
    skillsWindow:open()
    skillsButton:setOn(true)
  end
end

function checkExpSpeed()
  local player = g_game.getLocalPlayer()
  if not player then return end

  local currentExp = player:getExperience()
  local currentTime = g_clock.seconds()
  if player.lastExps ~= nil then
    player.expSpeed = (currentExp - player.lastExps[1][1])/(currentTime - player.lastExps[1][2])
    onLevelChange(player, player:getLevel(), player:getLevelPercent())
  else
    player.lastExps = {}
  end
  table.insert(player.lastExps, {currentExp, currentTime})
  if #player.lastExps > 30 then
    table.remove(player.lastExps, 1)
  end
end

function onMiniWindowClose()
  skillsButton:setOn(false)
end

function onSkillButtonClick(button)
  local percentBar = button:getChildById('percent')
  if percentBar then
    percentBar:setVisible(not percentBar:isVisible())
    if percentBar:isVisible() then
      button:setHeight(21)
      skillsWindow:setHeight(skillsWindow:getHeight() + 6)
      skillsWindow:setContentMaximumHeight((skillsWindow:getMaximumHeight() - 25) + 6)
    else
      button:setHeight(21 - 6)
      skillsWindow:setHeight(skillsWindow:getHeight() - 6)
      skillsWindow:setContentMaximumHeight((skillsWindow:getMaximumHeight() - 25) - 6)
    end
  end
end

function onExperienceChange(localPlayer, value)
  setSkillValue('experience', value)
end

function onLevelChange(localPlayer, value, percent)
  setSkillName('level', localPlayer:getName())
  setSkillValue('level', value)
  level = value
  local text = tr('You have %s percent to go', 100 - percent) .. '\n' ..
               tr('%s of experience left', expToAdvance(localPlayer:getLevel(), localPlayer:getExperience()))

  if localPlayer.expSpeed ~= nil then
     local expPerHour = math.floor(localPlayer.expSpeed * 3600)
     if expPerHour > 0 then
        local nextLevelExp = expForLevel(localPlayer:getLevel()+1)
        local hoursLeft = (nextLevelExp - localPlayer:getExperience()) / expPerHour
        local minutesLeft = math.floor((hoursLeft - math.floor(hoursLeft))*60)
        hoursLeft = math.floor(hoursLeft)
        text = text .. '\n' .. tr('%d of experience per hour', expPerHour)
        text = text .. '\n' .. tr('Next level in %d hours and %d minutes', hoursLeft, minutesLeft)
     end
  end

  setSkillPercent('experience', percent, text)
end

function onStaminaChange(localPlayer, stamina)
  local hours = math.floor(stamina / 60)
  local minutes = stamina % 60
  if minutes < 10 then
    minutes = '0' .. minutes
  end
  local percent = math.floor(100 * stamina / (42 * 60)) -- max is 42 hours

  setSkillValue('stamina', hours .. ":" .. minutes)
end

function onSkillChange(localPlayer, id, level, percent)
  if not skillsWindow:recursiveGetChildById('skillId' .. id) then return end
  setSkillValue('skillId' .. id, level)
  setSkillPercent('skillId' .. id, percent, tr('You have %s percent to go', 100 - percent))

  onBaseSkillChange(localPlayer, id, localPlayer:getSkillBaseLevel(id))
end

function onBaseSkillChange(localPlayer, id, baseLevel)
  if not skillsWindow:recursiveGetChildById('skillId' .. id) then return end
  setSkillBase('skillId'..id, localPlayer:getSkillLevel(id), baseLevel)
end

function onPokemonSkillChange(protocol, opcode, buffer)
  for id=0,7 do
    setSkillValue('pokemonSkillId' .. id, string.explode(buffer, '|')[id+2])
    skillsWindow:recursiveGetChildById('level'):setIcon('/images/game/clan/' .. string.explode(buffer, '|')[1])
  end
  for i=1,8 do
    if tonumber(string.explode(string.explode(buffer, '|')[10], ';')[i]) == 0 then
      skillsWindow:recursiveGetChildById('pokemonSkillId8'):getChildByIndex(i):setImageSource('/images/game/badges/'..badges[i]..'_off')
    else
      skillsWindow:recursiveGetChildById('pokemonSkillId8'):getChildByIndex(i):setImageSource('/images/game/badges/'..badges[i]..'_on')
    end
  end
end
