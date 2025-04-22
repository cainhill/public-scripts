-- ~/.config/mpv/scripts/caption-bar.lua
-- Last confirmed as working on 2025-04-22

-- Require code needed for drawing on video
local assdraw = require 'mp.assdraw'
local mp = require 'mp'

-- Setup a new on-screen display (OSD) overlay
local osd = mp.create_osd_overlay("ass-events")

-- Gather some key variables before getting started
local text = ""
local width = mp.get_property_number("width", 1280)
local height = mp.get_property_number("height", 720)

-- Function to clear and then draw the overlay
function draw_overlay()

    -- Clear the current overlay if present
    osd.data = ""
    osd:update()

    -- Prepare an empty drawing canvas
    local ass = assdraw.ass_new()
    ass:pos(0, 0)

    -- Paint the black background box
    local bar_height = 60
    ass:append("{\\an7\\bord0\\shad0\\1c&H000000&}")
    ass:draw_start()
    ass:move_to(0, height - bar_height)
    ass:line_to(width, height - bar_height)
    ass:line_to(width, height)
    ass:line_to(0, height)
    ass:line_to(0, height - bar_height)
    ass:draw_stop()

    -- Add the white text on top of the black background box
    local font_size = 32
    local text_y = height - bar_height + (bar_height - font_size) / 2
    ass:new_event()
    ass:pos(20, text_y)
    ass:append("{\\an7\\fs" .. font_size .. "\\bord0\\shad0\\1c&HFFFFFF&}")
    ass:append(text)

    -- Actually output the overlay now that it is designed
    osd.data = ass.text
    osd:update()
end

-- Function to get and set the title for the bottom bar
function display_metadata()

    -- Fetch metadata
    local title = mp.get_property("media-title");

    -- If title is empty or missing, fallback to filename
    if not title or title == "" then
        title = "[Please add a title to this video]"
    end
    
    -- Set the text to be displayed in the bottom bar
    text = title

    -- Recreate the overlay with the updated title
    draw_overlay()
end

-- Listen for when a new video is fully loaded
mp.register_event("playback-restart", function()
    display_metadata()
end)
