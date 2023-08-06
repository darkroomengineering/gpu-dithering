// https://github.com/makew0rld/dither/blob/master/ordered_ditherers.go
// http://caca.zoy.org/study/part2.html

export const ORDERED_DITHERERS = {
  BAYER2x2: {
    matrix: [
      [0, 3],
      [2, 1],
    ].flat(),
    x: 2,
    y: 2,
    max: 4,
  },
  BAYER4x4: {
    matrix: [
      [0, 12, 3, 15],
      [8, 4, 11, 7],
      [2, 14, 1, 13],
      [10, 6, 9, 5],
    ].flat(),
    x: 4,
    y: 4,
    max: 16,
  },
  BAYER8x8: {
    matrix: [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21],
    ].flat(),
    x: 8,
    y: 8,
    max: 64,
  },
}
