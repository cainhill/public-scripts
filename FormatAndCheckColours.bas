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
    Dim slide As slide
    For Each slide In ActivePresentation.Slides
      LoopShapes(slide)
    Next slide
End Sub

Sub LoopShapes(slide As slide)
    Dim shape As shape
    For Each shape In slide.Shapes
        If shape.HasTextFrame Then
            If shape.TextFrame.HasText Then
                HandleText(shape)
            End If
        End If
        ' TODO: Image
        ' TODO: Table
    Next shape
End Sub

Sub HandleText(shape as shape)
    Dim textRange As textRange: Set shape.TextFrame.TextRange
    Dim fontColour As Long
    For i = 1 To textRange.Hyperlinks.Count
        textRange.Hyperlinks(i).TextRange.Font.Underline = True
        If textRange.Hyperlinks(i).TextRange.Font.Color <> RGB(255, 0, 0) Then
            textRange.Hyperlinks(i).TextRange.Font.Color = RGB(0, 0, 255)
        End If
    Next i
    fontColour = shape.TextFrame.TextRange.Font.Color
    If Not IsValidColor(fontColour) Then
        shape.TextFrame.TextRange.Font.Color = RGB(255, 20, 147)
    End If
End Sub

Function IsValidColour(colour As Long) As Boolean
    IsValidColour = (colour = RGB(255, 0, 0)) Or (colour = RGB(0, 0, 255)) Or (colour = RGB(255, 20, 147))
    ' Valid colors are: red (#FF0000), blue (#0000FF), pink (#FF1493), or greyscale
    If color = RGB(255, 0, 0) Or color = RGB(0, 0, 255) Or color = RGB(255, 20, 147) Then
        IsValidColor = True ' Red, Blue, or Pink are allowed
    ElseIf hsl(2) = 0 Then
        IsValidColor = True ' Grayscale colors are allowed (saturation = 0)
    Else
        IsValidColor = False ' Non-compliant colors
    End If
End Function

' Returns true if colour is greyscale
Function IsGrayscale(R As Integer, G As Integer, B As Integer) As Boolean
    IsGrayscale = (R = G) And (G = B)
End Function

Sub FormatAndCheckColors()
    Dim slide As slide
    Dim shape As shape
    Dim textRange As textRange
    Dim fontColor As Long
    Dim fillColor As Long
    Dim borderColor As Long
    Dim tableFillColor As Long
    Dim tableBorderColor As Long
    Dim pictureBorderColor As Long
    Dim nonCompliantCount As Integer
    nonCompliantCount = 0

' HELPER: Returns true if colour is greyscale
Function IsGrayscale(R As Integer, G As Integer, B As Integer) As Boolean
    IsGrayscale = (R = G) And (G = B)
End Function

    ' Loop through each slide
    For Each slide In ActivePresentation.Slides
        ' Loop through each shape in the slide
        For Each shape In slide.Shapes
            ' STEP 1: Check for text hyperlinks and apply formatting
            If shape.HasTextFrame Then
                If shape.TextFrame.HasText Then
                    Set textRange = shape.TextFrame.TextRange
                    For i = 1 To textRange.Hyperlinks.Count
                        ' Apply blue color (#0000ff) and underline to the hyperlink text
                        If textRange.Hyperlinks(i).TextRange.Font.Color <> RGB(255, 0, 0) Then
                            textRange.Hyperlinks(i).TextRange.Font.Color = RGB(0, 0, 255) ' Blue
                            textRange.Hyperlinks(i).TextRange.Font.Underline = True
                        End If
                    Next i
                    
                    ' Remove non-yellow highlighting (assuming yellow is RGB(255, 255, 0))
                    If textRange.HighlightColor.RGB <> RGB(255, 255, 0) Then
                        textRange.HighlightColor.RGB = RGB(255, 255, 255) ' Remove highlight
                    End If
                End If
            End If

            ' STEP 2: Check colors and replace non-compliant colors with pink
            ' Check font color
            fontColor = shape.TextFrame.TextRange.Font.Color
            If Not IsValidColor(fontColor) Then
                shape.TextFrame.TextRange.Font.Color = RGB(255, 20, 147) ' Pink (#FF1493)
                nonCompliantCount = nonCompliantCount + 1
            End If

            ' Check fill color
            If shape.Fill.Type = msoFillSolid Then
                fillColor = shape.Fill.ForeColor.RGB
                If Not IsValidColor(fillColor) Then
                    shape.Fill.ForeColor.RGB = RGB(255, 20, 147) ' Pink (#FF1493)
                    nonCompliantCount = nonCompliantCount + 1
                End If
            End If

            ' Check border color for shapes
            If shape.Line.Visible = msoTrue Then
                borderColor = shape.Line.ForeColor.RGB
                If Not IsValidColor(borderColor) Then
                    shape.Line.ForeColor.RGB = RGB(255, 20, 147) ' Pink (#FF1493)
                    nonCompliantCount = nonCompliantCount + 1
                End If
            End If

            ' Check table fill color
            If shape.HasTable Then
                For Each row In shape.Table.Rows
                    For Each cell In row.Cells
                        tableFillColor = cell.Shape.Fill.ForeColor.RGB
                        If Not IsValidColor(tableFillColor) Then
                            cell.Shape.Fill.ForeColor.RGB = RGB(255, 20, 147) ' Pink (#FF1493)
                            nonCompliantCount = nonCompliantCount + 1
                        End If
                    Next cell
                Next row

                ' Check table border color
                For Each row In shape.Table.Rows
                    For Each cell In row.Cells
                        tableBorderColor = cell.Shape.Line.ForeColor.RGB
                        If Not IsValidColor(tableBorderColor) Then
                            cell.Shape.Line.ForeColor.RGB = RGB(255, 20, 147) ' Pink (#FF1493)
                            nonCompliantCount = nonCompliantCount + 1
                        End If
                    Next cell
                Next row
            End If

            ' Check picture border color
            If shape.Type = msoPicture Then
                pictureBorderColor = shape.Line.ForeColor.RGB
                If Not IsValidColor(pictureBorderColor) Then
                    shape.Line.ForeColor.RGB = RGB(255, 20, 147) ' Pink (#FF1493)
                    nonCompliantCount = nonCompliantCount + 1
                End If
            End If
        Next shape

        ' STEP 3: Add or remove the red "ISSUE" box in the top left corner based on non-compliant colors
        If nonCompliantCount > 0 Then
            ' Check if there is already an "ISSUE" box
            If Not IsIssueBoxPresent(slide) Then
                ' Create a red box in the top left corner with the text "ISSUE"
                CreateIssueBox slide
            End If
        Else
            ' If no non-compliant colors are found, delete the "ISSUE" box if it exists
            If IsIssueBoxPresent(slide) Then
                DeleteIssueBox slide
            End If
        End If
    Next slide
End Sub

' Function to check if the color is valid (red, blue, pink, or grayscale)
Function IsValidColor(color As Long) As Boolean
    ' Valid colors are: red (#FF0000), blue (#0000FF), pink (#FF1493), or grayscale (saturation = 0)
    Dim hsl As Variant
    hsl = RGBToHSL(color)
    
    If color = RGB(255, 0, 0) Or color = RGB(0, 0, 255) Or color = RGB(255, 20, 147) Then
        IsValidColor = True ' Red, Blue, or Pink are allowed
    ElseIf hsl(2) = 0 Then
        IsValidColor = True ' Grayscale colors are allowed (saturation = 0)
    Else
        IsValidColor = False ' Non-compliant colors
    End If
End Function

' Function to convert RGB color to HSL
Function RGBToHSL(rgb As Long) As Variant
    Dim r As Double, g As Double, b As Double
    Dim h As Double, s As Double, l As Double
    r = ((rgb And &HFF0000) \ &H10000) / 255
    g = ((rgb And &HFF00) \ &H100) / 255
    b = (rgb And &HFF) / 255
    
    Dim maxVal As Double, minVal As Double, delta As Double
    maxVal = Application.WorksheetFunction.Max(r, g, b)
    minVal = Application.WorksheetFunction.Min(r, g, b)
    delta = maxVal - minVal
    
    ' Calculate luminance
    l = (maxVal + minVal) / 2
    
    ' Calculate saturation
    If delta = 0 Then
        s = 0
    Else
        If l < 0.5 Then
            s = delta / (maxVal + minVal)
        Else
            s = delta / (2 - maxVal - minVal)
        End If
    End If
    
    ' Calculate hue
    If delta = 0 Then
        h = 0
    ElseIf maxVal = r Then
        h = (g - b) / delta
    ElseIf maxVal = g Then
        h = (b - r) / delta + 2
    Else
        h = (r - g) / delta + 4
    End If
    
    h = h * 60
    If h < 0 Then h = h + 360
    
    RGBToHSL = Array(h, s, l)
End Function

' Function to check if an "ISSUE" box is already present in the top-left corner of the slide
Function IsIssueBoxPresent(slide As slide) As Boolean
    Dim shape As shape
    On Error Resume Next
    Set shape = slide.Shapes("IssueBox")
    If Err.Number = 0 Then
        IsIssueBoxPresent = True
    Else
        IsIssueBoxPresent = False
    End If
    On Error GoTo 0
End Function

' Function to create an "ISSUE" box in the top-left corner of the slide
Sub CreateIssueBox(slide As slide)
    Dim shape As shape
    Set shape = slide.Shapes.AddTextbox(msoTextOrientationHorizontal, 0, 0, 100, 50)
    shape.Name = "IssueBox"
    shape.Fill.ForeColor.RGB = RGB(255, 0, 0) ' Red box
    shape.Line.ForeColor.RGB = RGB(255, 0, 0) ' Red border
    shape.TextFrame.TextRange.Text = "ISSUE"
    shape.TextFrame.TextRange.Font.Color = RGB(255, 255, 255) ' White text
    shape.TextFrame.TextRange.Font.Bold = msoTrue
    shape.TextFrame.TextRange.Font.Size = 18
    shape.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    shape.Top = 0
    shape.Left = 0
End Sub

' Function to delete the "ISSUE" box if it exists
Sub DeleteIssueBox(slide As slide)
    On Error Resume Next
    slide.Shapes("IssueBox").Delete
    On Error GoTo 0
End Sub