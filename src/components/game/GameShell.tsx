import { useState } from 'react'
import { BottomHud } from './BottomHud'
import { RightActionMenu } from './RightActionMenu'
import { SideUtility } from './SideUtility'
import { TopHud } from './TopHud'
import { WorldMap } from './WorldMap'
import { team } from './mock-data'

export function GameShell() {
  const initialId = team.find((m) => m)?.id ?? '1'
  const [activeTeamId, setActiveTeamId] = useState(initialId)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function flash(message: string) {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2200)
  }

  return (
    <div className="game-shell relative h-dvh w-full overflow-hidden text-white">
      <WorldMap />

      <TopHud onAddFunds={() => flash('Loja de diamantes em breve')} />
      <SideUtility
        onSettings={() => flash('Configurações em breve')}
        onShare={() => flash('Social em breve')}
      />
      <RightActionMenu
        activeId={activeMenu}
        onSelect={(id) => {
          setActiveMenu((current) => (current === id ? null : id))
          flash(`Menu: ${id}`)
        }}
      />
      <BottomHud
        activeId={activeTeamId}
        onSelectTeam={setActiveTeamId}
        playing={playing}
        onPlay={() => {
          setPlaying((value) => !value)
          flash(playing ? 'Idle pausado' : 'Idle iniciado')
        }}
        onShop={() => flash('Poke Shop em breve')}
      />

      {toast ? (
        <div className="pointer-events-none absolute inset-x-0 top-[42%] z-40 flex justify-center px-4">
          <p className="hud-toast">{toast}</p>
        </div>
      ) : null}
    </div>
  )
}
