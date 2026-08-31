#requires -Version 7.0
# ---------------------------------------------------------------------------
# link-skills.ps1 — Cria/atualiza junctions POR SKILL em ~\.claude\skills,
# uma por pasta skills\<categoria>\<skill> desta instância do Brain (a raiz do
# Brain é resolvida como a pasta pai de scripts\).
#
# Uso:
#   pwsh scripts/link-skills.ps1 -WhatIf        # simulação — nada é escrito
#   pwsh scripts/link-skills.ps1 -Autorizado    # execução real
#
# Idempotente: junctions corretas são mantidas, divergentes são recriadas e
# junctions órfãs (que apontam para dentro da raiz do Brain mas não têm mais
# skill correspondente) são removidas. Pastas reais e links de terceiros no
# destino nunca são tocados.
# ---------------------------------------------------------------------------
# AVISO: a execução deste script escreve FORA da raiz do Brain (no diretório
# $env:USERPROFILE\.claude\skills) e exige autorização explícita e pontual do
# operador — política de fronteiras de escrita do AGENTS.md. Sem o switch
# -Autorizado o script recusa a execução (apenas -WhatIf é aceito).

[CmdletBinding(SupportsShouldProcess)]
param(
    [switch]$Autorizado
)

Write-Warning ("Este script escreve FORA da raiz do Brain (em $env:USERPROFILE\.claude\skills) " +
    "e exige autorização explícita e pontual do operador (fronteiras de escrita do AGENTS.md).")

$ErrorActionPreference = 'Stop'

if (-not $Autorizado -and -not $WhatIfPreference) {
    Write-Error -ErrorAction Continue -Message ("Execução recusada: passe -Autorizado somente com autorização " +
        "explícita do operador (fronteiras de escrita do AGENTS.md). Para ver o que seria feito sem escrever nada, use -WhatIf.")
    exit 1
}

$BrainRoot  = Split-Path -Parent $PSScriptRoot
$SkillsRoot = Join-Path $BrainRoot 'skills'
$DestRoot   = Join-Path $env:USERPROFILE '.claude\skills'

if (-not (Test-Path -LiteralPath $SkillsRoot)) {
    Write-Error "Pasta de skills não encontrada: $SkillsRoot"
    exit 1
}

# Toda pasta skills\<categoria>\<skill> que contém SKILL.md é uma skill.
$skillDirs = Get-ChildItem -Path $SkillsRoot -Directory |
    ForEach-Object { Get-ChildItem -Path $_.FullName -Directory } |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }

if (-not $skillDirs) {
    Write-Warning "Nenhuma skill com SKILL.md encontrada em $SkillsRoot — nada a fazer."
    exit 0
}

# Nome do junction = nome da pasta da skill; colisões entre categorias são recusadas.
$porNome = @{}
foreach ($dir in $skillDirs) {
    if ($porNome.ContainsKey($dir.Name)) {
        Write-Warning ("Colisão de nome de skill: '$($dir.Name)' existe em mais de uma categoria; " +
            "mantendo $($porNome[$dir.Name].FullName) e ignorando $($dir.FullName).")
    }
    else {
        $porNome[$dir.Name] = $dir
    }
}

if (-not (Test-Path -LiteralPath $DestRoot)) {
    if ($PSCmdlet.ShouldProcess($DestRoot, 'Criar diretório de destino')) {
        New-Item -ItemType Directory -Path $DestRoot -Force | Out-Null
    }
}

$criadas = 0; $mantidas = 0; $recriadas = 0; $removidas = 0

foreach ($nome in ($porNome.Keys | Sort-Object)) {
    $alvo = $porNome[$nome].FullName
    $link = Join-Path $DestRoot $nome

    if (Test-Path -LiteralPath $link) {
        $item = Get-Item -LiteralPath $link -Force
        $alvoAtual = [string]$item.Target
        if ($item.LinkType -eq 'Junction' -and $alvoAtual -eq $alvo) {
            $mantidas++
            continue
        }
        if ($item.LinkType -eq 'Junction') {
            if ($PSCmdlet.ShouldProcess($link, "Recriar junction (alvo atual: $alvoAtual; novo alvo: $alvo)")) {
                $item.Delete()
                New-Item -ItemType Junction -Path $link -Target $alvo | Out-Null
            }
            $recriadas++
            continue
        }
        Write-Warning "$link existe e NÃO é junction — deixado intacto; resolva manualmente."
        continue
    }

    if ($PSCmdlet.ShouldProcess($link, "Criar junction -> $alvo")) {
        New-Item -ItemType Junction -Path $link -Target $alvo | Out-Null
    }
    $criadas++
}

# Remove junctions órfãs: apontam para dentro da raiz do Brain, mas a skill
# correspondente não existe mais (ou mudou de lugar).
if (Test-Path -LiteralPath $DestRoot) {
    foreach ($item in (Get-ChildItem -Path $DestRoot -Directory -Force)) {
        if ($item.LinkType -ne 'Junction' -or -not $item.Target) { continue }
        $t = [string]$item.Target
        if (-not $t.StartsWith($BrainRoot, [System.StringComparison]::OrdinalIgnoreCase)) { continue }
        $desejada = $porNome.ContainsKey($item.Name) -and ($porNome[$item.Name].FullName -eq $t)
        if (-not $desejada) {
            if ($PSCmdlet.ShouldProcess($item.FullName, "Remover junction órfã (alvo: $t)")) {
                $item.Delete()
            }
            $removidas++
        }
    }
}

Write-Host "Junctions — criadas: $criadas, mantidas: $mantidas, recriadas: $recriadas, removidas (órfãs): $removidas."
if ($WhatIfPreference) {
    Write-Host '(-WhatIf: nenhuma alteração foi escrita; os contadores mostram o que aconteceria.)'
}
exit 0
