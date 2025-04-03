// link: https://www.kavaliro.com/wp-content/uploads/2014/03/AES.pdf
// for debugging: https://www.cryptool.org/en/cto/aes-step-by-step

class AES {
  constructor(secretKey = "this is a public key") {
    this.secretKey = secretKey;
  }
  // Khởi tạo khóa
  initKey(keyText) {
    // Chuyển khóa từ text sang hex sau đó chuyển sang mảng byte
    const hexString = this.textToHex(keyText);
    let bytes = this.hexStringToBytes(hexString);
    // Nếu khóa dài hơn 16 byte thì cắt bớt, ngược lại thêm 0 vào cuối
    if (bytes.length > 16) {
      bytes = bytes.slice(0, 16);
    } else if (bytes.length < 16) {
      bytes = bytes.concat(new Array(16 - bytes.length).fill(0));
    }

    // Khởi tạo các khóa con từ khóa gốc
    this.expandedKey = this.keyExpansion(bytes);
  }

  hexStringToBytes(hexString) {
    let bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        let hex = hexString.slice(i, i + 2); // Lấy 2 ký tự liên tiếp
        bytes.push(parseInt(hex, 16)); // Chuyển từ hex sang số nguyên
    }
    // console.log(bytes);
    return bytes;
  }

  hexStringToArray(hexString) {
    let bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        let hex = hexString.slice(i, i + 2); // Lấy 2 ký tự liên tiếp
        bytes.push(hex); // Chuyển từ hex sang số nguyên
    }
    // console.log(bytes);
    return bytes;
  }

  // Sbox sử dụng cho pha subBytes
  Sbox = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
    0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
    0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
    0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
    0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
    0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
    0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
    0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
    0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
    0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
    0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
    0xb0, 0x54, 0xbb, 0x16,
  ];

  // Invert Sbox sử dụng cho pha invSubBytes
  invSbox = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e,
    0x81, 0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87,
    0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32,
    0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49,
    0x6d, 0x8b, 0xd1, 0x25, 0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16,
    0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50,
    0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05,
    0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02,
    0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91, 0x11, 0x41,
    0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
    0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89,
    0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b,
    0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59,
    0x27, 0x80, 0xec, 0x5f, 0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d,
    0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d,
    0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63,
    0x55, 0x21, 0x0c, 0x7d,
  ];

  // Rcon sử dụng cho pha keyExpansion ( sinh khóa con )
  Rcon = [
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c,
    0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91,
  ];

  // Chuyển text sang hex
  textToHex(text) {
    const utf8Bytes = new TextEncoder().encode(text);
    let hexString = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      hexString += utf8Bytes[i].toString(16).padStart(2, "0");
      if (i != utf8Bytes.length - 1) {
        hexString += "";
      }
    }
    return hexString;
  }

  // Chuyển hex sang text
  hexToText(hexString) {
    let utf8Bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
      utf8Bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    const text = new TextDecoder().decode(new Uint8Array(utf8Bytes));
    return text;
  }

  // Tạo các khóa con từ khóa gốc
  keyExpansion(key) {
    const Nk = 4; // Số từ trong khóa (128 bit key có 4 từ)
    const Nb = 4; // Số cột trong mảng trạng thái
    const Nr = 10; // Số vòng lặp (128-bit key có 10 vòng)

    const w = new Array(Nb * (Nr + 1));

    w[0] = [key[0], key[1], key[2], key[3]];
    w[1] = [key[4], key[5], key[6], key[7]];
    w[2] = [key[8], key[9], key[10], key[11]];
    w[3] = [key[12], key[13], key[14], key[15]];

    // Bắt đầu mở rộng khóa
    for (let i = Nk; i < Nb * (Nr + 1); i++) {
      let temp = w[i - 1].slice(); // copy
      // Thực hiện phép thay thế byte
      if (i % Nk === 0) {
        temp = this.subWord(this.rotWord(temp));
        temp[0] ^= this.Rcon[i / Nk];
      }

      // XOR với từ ở vị trí Nk trước đó
      w[i] = new Array(4);
      for (let j = 0; j < 4; j++) {
        w[i][j] = w[i - Nk][j] ^ temp[j];
      }
    }

    return w;
  }

  // Hàm thực hiện phép thay thế byte
  subWord(word) {
    for (let i = 0; i < 4; i++) {
      word[i] = this.Sbox[word[i]];
    }
    return word;
  }

  // Hàm thực hiện phép dịch vòng trái
  rotWord(word) {
    const temp = word[0];
    for (let i = 0; i < 3; i++) {
      word[i] = word[i + 1];
    }
    word[3] = temp;
    return word;
  }

  // Hàm so state với khóa con
  addRoundKey(state, round) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] ^= this.expandedKey[round * 4 + j][i];
      }
    }
    return state;
  }

  // Hàm thực hiện phép thay thế byte
  subBytes(state) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] = this.Sbox[state[i][j]];
      }
    }
    return state;
  }

  // Hàm thực hiện phép dịch hàng
  shiftRows(state) {
    const temp = new Array(4);
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        temp[j] = state[i][(j + i) % 4];
      }
      for (let j = 0; j < 4; j++) {
        state[i][j] = temp[j];
      }
    }
    return state;
  }

  // Hàm mixColumns thực hiện phép nhân 2 ma trận
  mixColumns(state) {
    const temp = new Array(4);
    for (let i = 0; i < 4; i++) {
      temp[0] =
        this.gmul(0x02, state[0][i]) ^
        this.gmul(0x03, state[1][i]) ^
        state[2][i] ^
        state[3][i];
      temp[1] =
        state[0][i] ^
        this.gmul(0x02, state[1][i]) ^
        this.gmul(0x03, state[2][i]) ^
        state[3][i];
      temp[2] =
        state[0][i] ^
        state[1][i] ^
        this.gmul(0x02, state[2][i]) ^
        this.gmul(0x03, state[3][i]);
      temp[3] =
        this.gmul(0x03, state[0][i]) ^
        state[1][i] ^
        state[2][i] ^
        this.gmul(0x02, state[3][i]);
      for (let j = 0; j < 4; j++) {
        state[j][i] = temp[j];
      }
    }
    return state;
  }

  // Hàm sử dụng cho pha mixColumns
  //p = (a×b₀) ⊕ (a×2×b₁) ⊕ (a×2²×b₂) ⊕ ... ⊕ (a×2⁷×b₇)
  gmul(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) {
        p ^= a;
      }
      const hiBitSet = a & 0x80;
      a <<= 1;
      if (hiBitSet) {
        a ^= 0x1b; /* x^8 + x^4 + x^3 + x + 1 */
      }
      b >>= 1;
    }
    return p & 0xff;
  }

  // invert subBytes
  invSubBytes(state) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        state[i][j] = this.invSbox[state[i][j]];
      }
    }
    return state;
  }

  // invert shiftRows
  invShiftRows(state) {
    const temp = new Array(4);
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        temp[j] = state[i][(j - i + 4) % 4];
      }
      for (let j = 0; j < 4; j++) {
        state[i][j] = temp[j];
      }
    }
    return state;
  }

  // invert mixColumns
  invMixColumns(state) {
    const temp = new Array(4);
    for (let i = 0; i < 4; i++) {
      temp[0] =
        this.gmul(0x0e, state[0][i]) ^
        this.gmul(0x0b, state[1][i]) ^
        this.gmul(0x0d, state[2][i]) ^
        this.gmul(0x09, state[3][i]);
      temp[1] =
        this.gmul(0x09, state[0][i]) ^
        this.gmul(0x0e, state[1][i]) ^
        this.gmul(0x0b, state[2][i]) ^
        this.gmul(0x0d, state[3][i]);
      temp[2] =
        this.gmul(0x0d, state[0][i]) ^
        this.gmul(0x09, state[1][i]) ^
        this.gmul(0x0e, state[2][i]) ^
        this.gmul(0x0b, state[3][i]);
      temp[3] =
        this.gmul(0x0b, state[0][i]) ^
        this.gmul(0x0d, state[1][i]) ^
        this.gmul(0x09, state[2][i]) ^
        this.gmul(0x0e, state[3][i]);
      for (let j = 0; j < 4; j++) {
        state[j][i] = temp[j];
      }
    }
    return state;
  }

  // Hàm tách dữ liệu thành các block 128 bit
  // Mỗi block 128 bit được biểu diễn bằng một mảng 4x4
  separateIntoStateBlocks(plainText) {
    const hexString = this.textToHex(plainText);
    let bytes = this.hexStringToBytes(hexString);

    const stateBlocks = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const straightBlock = [];
      for (let j = 0; j < 16; j++) {
        if (i + j < bytes.length) {
          straightBlock.push(bytes[i + j]);
        } else {
          straightBlock.push(0);
        }
      }

      let block = new Array(4);
      for (let i = 0; i < 4; i++) {
        block[i] = new Array(4);
        for (let j = 0; j < 4; j++) {
          block[i][j] = straightBlock[i + 4 * j];
        }
      }

      stateBlocks.push(block);
    }
    return stateBlocks;
  }

  // Hàm chuyển block mảng 2 chiều thành hex text
  stateBlockToText(stateBlock) {
    const text = stateBlock
      .map((w) => w.map((b) => b.toString(16).padStart(2, "0")).join(""))
      .join("");
    return text;
  }

  // Hàm chuyển hex text thành block mảng 2 chiều
  textToStateBlock(text) {
    const bytes = this.hexStringToBytes(text);
    const block = new Array(4);
    for (let i = 0; i < 4; i++) {
      block[i] = bytes.slice(i * 4, i * 4 + 4);
    }
    return block;
  }

  // Hàm chuyển từ mảng 1 chiều thành mảng 2 chiều
  convertToTwoDimensionalArray(array) {
    let block = new Array(4);
    for (let i = 0; i < 4; i++) {
      block[i] = new Array(4);
      for (let j = 0; j < 4; j++) {
        block[i][j] = array[i + 4 * j];
      }
    }
    return block;
  }

  // Hàm thực hiện phép XOR cho 2 mảng 2 chiều
  xorArrays2D(array1, array2) {
    if (
      array1.length !== array2.length ||
      array1[0].length !== array2[0].length
    ) {
      throw new Error("Arrays must have the same dimensions");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
      result.push([]);
      for (let j = 0; j < array1[i].length; j++) {
        result[i].push(array1[i][j] ^ array2[i][j]);
      }
    }
    return result;
  }

  // Hàm thực hiện phép mã hóa cho một block dữ liệu 128 bit
  encryptStateBlock(state) {
    if (state.length !== 4 || state[0].length !== 4) {
      throw new Error("Invalid state");
    }

    state = this.addRoundKey(state, 0);

    for (let round = 1; round < 10; round++) {
      state = this.subBytes(state);
      state = this.shiftRows(state);
      state = this.mixColumns(state);
      state = this.addRoundKey(state, round);
    }

    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.addRoundKey(state, 10);

    // XOR với initial vector để tăng độ bảo mật
    // state = this.xorArrays2D(this.initialVector, state);

    return state;
  }

  // Hàm thực hiện phép giải mã cho một block dữ liệu 128 bit
  decryptStateBlock(state) {
    // XOR với initial vector trước ( theo thuật toán mã hóa )
    // state = this.xorArrays2D(this.initialVector, state);

    state = this.addRoundKey(state, 10);

    for (let round = 9; round > 0; round--) {
      state = this.invShiftRows(state);
      state = this.invSubBytes(state);
      state = this.addRoundKey(state, round);
      state = this.invMixColumns(state);
    }

    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    state = this.addRoundKey(state, 0);

    return state;
  }

  // Hàm mã hóa dữ liệu
  encrypt(data, secretKeyAes) {
    // Lấy secret key từ biến môi trường hoặc sử dụng mặc định
    if (!secretKeyAes) {
      secretKeyAes = this.secretKey;
    }

    // Khởi tạo khóa
    this.initKey(secretKeyAes);

    // Khởi tạo initial vector

    // Tách dữ liệu thành các block nhỏ 128 bit
    const stateBlocks = this.separateIntoStateBlocks(data);

    // Mã hóa từng block dữ liệu và chuyển kết quả sang hex text
    const cipherText = stateBlocks
      .map((state) => {
        const stateBlock = this.encryptStateBlock(state);
        return this.stateBlockToText(stateBlock);
      })
      .join("");

    // trả về kết quả mã hóa dưới dạng hex text
    return cipherText;
  }

  // Hàm giải mã dữ liệu
  decrypt(cipherText, secretKeyAes) {
    // Lấy secret key từ biến môi trường hoặc sử dụng mặc định
    if (!secretKeyAes) {
      secretKeyAes = this.secretKey;
    }

    // Khởi tạo khóa
    this.initKey(secretKeyAes);

    // Khởi tạo initial vector

    const array = this.hexStringToArray(cipherText);

    // Độ dài mảng phải là bội số của 16
    if (array.length % 16 !== 0) {
      throw new Error("Invalid cipher text");
    }

    // Chuyển hex text thành block các mảng 2 chiều có kích thước 4x4
    const stateBlocks = [];
    for (let i = 0; i < array.length; i += 16) {
      const subArray = array.slice(i, i + 16);
      const stateBlock = this.textToStateBlock(subArray.join(""));
      stateBlocks.push(stateBlock);
    }

    // Thực hiện giải mã từng block dữ liệu và chuyển kết quả sang hex text
    const hexResult = stateBlocks
      .map((state) => {
        const decryptedStateBlock = this.decryptStateBlock(state);

        let hexText = "";
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            const hexChar = decryptedStateBlock[j][i]
              .toString(16)
              .padStart(2, "0");
            if (hexChar !== "00") {
              hexText += hexChar;
            }
          }
        }

        return hexText;
      })
      .join("");

    // Chuyển từ hex text sang text
    const plainText = this.hexToText(hexResult);

    return plainText;
  }
}

module.exports = new AES();
