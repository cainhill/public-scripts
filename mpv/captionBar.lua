-- ~/.config/mpv/scripts/caption-bar.lua

local assdraw = require 'mp.assdraw'
local mp = require 'mp'

local osd = mp.create_osd_overlay("ass-events")
local text = ""
local width, height = nil, nil

function update_overlay()
    if not width or not height then return end

    local ass = assdraw.ass_new()
    local bar_height = 60

    -- Black background bar at bottom
    ass:new_event()
    ass:pos(0, 0)
    ass:append("{\\an7\\bord0\\shad0\\1c&H000000&}")
    ass:draw_start()
    ass:move_to(0, height - bar_height)
    ass:line_to(width, height - bar_height)
    ass:line_to(width, height)
    ass:line_to(0, height)
    ass:line_to(0, height - bar_height)
    ass:draw_stop()

    -- White left-aligned text, vertically centered in the bar
    local font_size = 32
    local text_y = height - bar_height + (bar_height - font_size) / 2

    ass:new_event()
    ass:pos(20, text_y)
    ass:append("{\\an7\\fs" .. font_size .. "\\bord0\\shad0\\1c&HFFFFFF&}")
    ass:append(text)

    osd.data = ass.text
    osd:update()
end

function display_metadata()
    local meta = mp.get_property_native("metadata") or {}
    text = meta["title"] or ""
    update_overlay()
end

mp.observe_property("width", "native", function(_, val)
    width = val
    update_overlay()
end)

mp.observe_property("height", "native", function(_, val)
    height = val
    update_overlay()
end)

mp.register_event("file-loaded", display_metadata)
