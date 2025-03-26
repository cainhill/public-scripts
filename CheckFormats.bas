' Last Updated: March 25, 2025
' Author: Cain Hill
' Purpose: Use this script to find and fix slide formatting issues
' Slide Format Goals:
'   1. Text links must be underlined and coloured either blue or red
'   2. Text highlights must be yellow
'   3. Slides must only use this colour set: red, blue, greyscale, pink
' This Script:
'   1. Sets all text hyperlinks to underlined
'   2. Sets all text hyperlinks to blue (#0000ff), if not already red (#ff0000)
'   3. Sets all text highlights to use yellow (#ffff00)
'   4. Sets all text/fill/border colours to pink, if not already greyscale (saturation = 0)
' 


Sub CheckFormats()
    Dim slide As Slide
    For Each slide In ActivePresentation.Slides
      LoopShapes(slide)
    Next slide
End Sub

Sub LoopShapes(slide As slide)
    Dim shape As Shape
    For Each shape In slide.Shapes
        If shape.HasTextFrame Then
            If shape.TextFrame.HasText Then
                HandleText(shape)
            End If
        End If
        If shape.Type = msoPicture Then
            HandlePicture(shape)
        End If
        If shape.HasTable Then
            HandleTable(shape)
        Else
            HandleShape(shape)
        End If
    Next shape
End Sub

Sub HandleText(shape as shape)

    Dim textRange As textRange: Set textRange = shape.TextFrame.TextRange
    Dim fontColour As Long
    Dim i As Integer
    Dim run As TextRange

    For i = 1 To textRange.Hyperlinks.Count
        textRange.Hyperlinks(i).TextRange.Font.Underline = True
        If textRange.Hyperlinks(i).TextRange.Font.Color <> RGB(255, 0, 0) Then
            textRange.Hyperlinks(i).TextRange.Font.Color = RGB(0, 0, 255)
        End If
    Next i

    If textRange.Runs.Count = 0 Then Exit Sub
    For i = 1 To textRange.Runs.Count
        Set run = textRange.Runs(i)
        If run.HighlightColor.RGB <> RGB(255, 255, 0) Then
            run.HighlightColor.RGB = RGB(255, 255, 0)
        End If
        If Not IsValidColor(run.Font.Color) Then
            run.Font.Color = RGB(255, 20, 147)
        End If
    Next i

End Sub

Sub HandleShape(shape)
  Dim shapeFillColour As Long
  Dim shapeBorderColour As Long
	If shape.Fill.Visible Then
	    shapeFillColour = shape.Fill.ForeColor.RGB
	    If Not IsValidColour(shapeFillColour) Then
	        shape.Fill.ForeColor.RGB = RGB(255, 20, 147)
	    End If
	End If
	If shape.Line.Weight > 0 Then
	    shapeBorderColour = shape.Line.ForeColor.RGB
	    If Not IsValidColour(shapeBorderColour) Then
	        shape.Line.ForeColor.RGB = RGB(255, 20, 147)
	    End If
	End If
End Sub

Sub HandlePicture(shape)
    Dim pictureBorderColour As Long: pictureBorderColour = shape.Line.ForeColor.RGB
    If Not IsValidColour(pictureBorderColour) Then
        shape.Line.ForeColor.RGB = RGB(255, 20, 147)
    End If
End Sub

Sub HandleTable(shape)
    Dim tableFillColour As Long
    Dim tableBorderColour As Long
    For Each row In shape.Table.Rows
	      For Each cell In row.Cells
	          tableFillColour = cell.Shape.Fill.ForeColor.RGB
	          If Not IsValidColour(tableFillColour) Then
	              cell.Shape.Fill.ForeColor.RGB = RGB(255, 20, 147)
	          End If
	          If cell.Shape.Line.Weight > 0 Then
	              tableBorderColour = cell.Shape.Line.ForeColor.RGB
	              If Not IsValidColour(tableBorderColour) Then
	                  cell.Shape.Line.ForeColor.RGB = RGB(255, 20, 147)
	              End If
	          End If
	      Next cell
	  Next row
End Sub

' Returns true if colour is greyscale, red, blue, or pink
Function IsValidColour(colour As Long) As Boolean
    IsValidColour = IsGreyscale(Colour) Or (colour = RGB(255, 0, 0)) Or (colour = RGB(0, 0, 255)) Or (colour = RGB(255, 20, 147))
End Function

' Returns true if colour is greyscale
Function IsGreyscale(Colour As Long) As Boolean
    Dim R As Integer: R = Colour Mod 256
    Dim G As Integer: G = (Colour \ 256) Mod 256 
    Dim B As Integer: B = (Colour \ 65536) Mod 256
    IsGreyscale = (R = G) And (G = B)
End Function