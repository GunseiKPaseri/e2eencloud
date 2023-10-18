import { describe, test, expect } from 'vitest';
import { assertNotNull } from './assert';
import { bs58CheckDecodeWithoutErr, bs58CheckEncode } from './bs58check';
import { byteArray2hex, hex2bytearray } from './uint8';

const testcase = [
  {
    payload: '0065a16059864a2fdbc7c99a4723a8395bc6f188eb',
    string: '1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62i',
  },
  {
    payload: '0574f209f6ea907e2ea48f74fae05782ae8a665257',
    string: '3CMNFxN1oHBc4R1EpboAL5yzHGgE611Xou',
  },
  {
    payload: '6f53c0307d6851aa0ce7825ba883c6bd9ad242b486',
    string: 'mo9ncXisMeAoXwqcV5EWuyncbmCcQN4rVs',
  },
  {
    payload: 'c46349a418fc4578d10a372b54b45c280cc8c4382f',
    string: '2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br',
  },
  {
    payload:
      '80eddbdc1168f1daeadbd3e44c1e3f8f5a284c2029f78ad26af98583a499de5b19',
    string: '5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr',
  },
  {
    payload:
      '8055c9bccb9ed68446d1b75273bbce89d7fe013a8acd1625514420fb2aca1a21c401',
    string: 'Kz6UJmQACJmLtaQj5A3JAge4kVTNQ8gbvXuwbmCj7bsaabudb3RD',
  },
  {
    payload:
      'ef36cb93b9ab1bdabf7fb9f2c04f1b9cc879933530ae7842398eef5a63a56800c2',
    string: '9213qJab2HNEpMpYNBa7wHGFKKbkDn24jpANDs2huN3yi4J11ko',
  },
  {
    payload:
      'efb9f4892c9e8282028fea1d2667c4dc5213564d41fc5783896a0d843fc15089f301',
    string: 'cTpB4YiyKiBcPxnefsDpbnDxFDffjqJob8wGCEDXxgQ7zQoMXJdH',
  },
  {
    payload: '006d23156cbbdcc82a5a47eee4c2c7c583c18b6bf4',
    string: '1Ax4gZtb7gAit2TivwejZHYtNNLT18PUXJ',
  },
  {
    payload: '05fcc5460dd6e2487c7d75b1963625da0e8f4c5975',
    string: '3QjYXhTkvuj8qPaXHTTWb5wjXhdsLAAWVy',
  },
  {
    payload: '6ff1d470f9b02370fdec2e6b708b08ac431bf7a5f7',
    string: 'n3ZddxzLvAY9o7184TB4c6FJasAybsw4HZ',
  },
  {
    payload: 'c4c579342c2c4c9220205e2cdc285617040c924a0a',
    string: '2NBFNJTktNa7GZusGbDbGKRZTxdK9VVez3n',
  },
  {
    payload:
      '80a326b95ebae30164217d7a7f57d72ab2b54e3be64928a19da0210b9568d4015e',
    string: '5K494XZwps2bGyeL71pWid4noiSNA2cfCibrvRWqcHSptoFn7rc',
  },
  {
    payload:
      '807d998b45c219a1e38e99e7cbd312ef67f77a455a9b50c730c27f02c6f730dfb401',
    string: 'L1RrrnXkcKut5DEMwtDthjwRcTTwED36thyL1DebVrKuwvohjMNi',
  },
  {
    payload:
      'efd6bca256b5abc5602ec2e1c121a08b0da2556587430bcf7e1898af2224885203',
    string: '93DVKyFYwSN6wEo3E2fCrFPUp17FtrtNi2Lf7n4G3garFb16CRj',
  },
  {
    payload:
      'efa81ca4e8f90181ec4b61b6a7eb998af17b2cb04de8a03b504b9e34c4c61db7d901',
    string: 'cTDVKtMGVYWTHCb1AFjmVbEbWjvKpKqKgMaR3QJxToMSQAhmCeTN',
  },
  {
    payload: '007987ccaa53d02c8873487ef919677cd3db7a6912',
    string: '1C5bSj1iEGUgSTbziymG7Cn18ENQuT36vv',
  },
  {
    payload: '0563bcc565f9e68ee0189dd5cc67f1b0e5f02f45cb',
    string: '3AnNxabYGoTxYiTEZwFEnerUoeFXK2Zoks',
  },
  {
    payload: '6fef66444b5b17f14e8fae6e7e19b045a78c54fd79',
    string: 'n3LnJXCqbPjghuVs8ph9CYsAe4Sh4j97wk',
  },
  {
    payload: 'c4c3e55fceceaa4391ed2a9677f4a4d34eacd021a0',
    string: '2NB72XtkjpnATMggui83aEtPawyyKvnbX2o',
  },
  {
    payload:
      '80e75d936d56377f432f404aabb406601f892fd49da90eb6ac558a733c93b47252',
    string: '5KaBW9vNtWNhc3ZEDyNCiXLPdVPHCikRxSBWwV9NrpLLa4LsXi9',
  },
  {
    payload:
      '808248bd0375f2f75d7e274ae544fb920f51784480866b102384190b1addfbaa5c01',
    string: 'L1axzbSyynNYA8mCAhzxkipKkfHtAXYF4YQnhSKcLV8YXA874fgT',
  },
  {
    payload:
      'ef44c4f6a096eac5238291a94cc24c01e3b19b8d8cef72874a079e00a242237a52',
    string: '927CnUkUbasYtDwYwVn2j8GdTuACNnKkjZ1rpZd2yBB1CLcnXpo',
  },
  {
    payload:
      'efd1de707020a9059d6d3abaf85e17967c6555151143db13dbb06db78df0f15c6901',
    string: 'cUcfCMRjiQf85YMzzQEk9d1s5A4K7xL5SmBCLrezqXFuTVefyhY7',
  },
  {
    payload: '00adc1cc2081a27206fae25792f28bbc55b831549d',
    string: '1Gqk4Tv79P91Cc1STQtU3s1W6277M2CVWu',
  },
  {
    payload: '05188f91a931947eddd7432d6e614387e32b244709',
    string: '33vt8ViH5jsr115AGkW6cEmEz9MpvJSwDk',
  },
  {
    payload: '6f1694f5bc1a7295b600f40018a618a6ea48eeb498',
    string: 'mhaMcBxNh5cqXm4aTQ6EcVbKtfL6LGyK2H',
  },
  {
    payload: 'c43b9b3fd7a50d4f08d1a5b0f62f644fa7115ae2f3',
    string: '2MxgPqX1iThW3oZVk9KoFcE5M4JpiETssVN',
  },
  {
    payload:
      '80091035445ef105fa1bb125eccfb1882f3fe69592265956ade751fd095033d8d0',
    string: '5HtH6GdcwCJA4ggWEL1B3jzBBUB8HPiBi9SBc5h9i4Wk4PSeApR',
  },
  {
    payload:
      '80ab2b4bcdfc91d34dee0ae2a8c6b6668dadaeb3a88b9859743156f462325187af01',
    string: 'L2xSYmMeVo3Zek3ZTsv9xUrXVAmrWxJ8Ua4cw8pkfbQhcEFhkXT8',
  },
  {
    payload:
      'efb4204389cef18bbe2b353623cbf93e8678fbc92a475b664ae98ed594e6cf0856',
    string: '92xFEve1Z9N8Z641KQQS7ByCSb8kGjsDzw6fAmjHN1LZGKQXyMq',
  },
  {
    payload:
      'efe7b230133f1b5489843260236b06edca25f66adb1be455fbd38d4010d48faeef01',
    string: 'cVM65tdYu1YK37tNoAyGoJTR13VBYFva1vg9FLuPAsJijGvG6NEA',
  },
  {
    payload: '00c4c1b72491ede1eedaca00618407ee0b772cad0d',
    string: '1JwMWBVLtiqtscbaRHai4pqHokhFCbtoB4',
  },
  {
    payload: '05f6fe69bcb548a829cce4c57bf6fff8af3a5981f9',
    string: '3QCzvfL4ZRvmJFiWWBVwxfdaNBT8EtxB5y',
  },
  {
    payload: '6f261f83568a098a8638844bd7aeca039d5f2352c0',
    string: 'mizXiucXRCsEriQCHUkCqef9ph9qtPbZZ6',
  },
  {
    payload: 'c4e930e1834a4d234702773951d627cce82fbb5d2e',
    string: '2NEWDzHWwY5ZZp8CQWbB7ouNMLqCia6YRda',
  },
  {
    payload:
      '80d1fab7ab7385ad26872237f1eb9789aa25cc986bacc695e07ac571d6cdac8bc0',
    string: '5KQmDryMNDcisTzRp3zEq9e4awRmJrEVU1j5vFRTKpRNYPqYrMg',
  },
  {
    payload:
      '80b0bbede33ef254e8376aceb1510253fc3550efd0fcf84dcd0c9998b288f166b301',
    string: 'L39Fy7AC2Hhj95gh3Yb2AU5YHh1mQSAHgpNixvm27poizcJyLtUi',
  },
  {
    payload:
      'ef037f4192c630f399d9271e26c575269b1d15be553ea1a7217f0cb8513cef41cb',
    string: '91cTVUcgydqyZLgaANpf1fvL55FH53QMm4BsnCADVNYuWuqdVys',
  },
  {
    payload:
      'ef6251e205e8ad508bab5596bee086ef16cd4b239e0cc0c5d7c4e6035441e7d5de01',
    string: 'cQspfSzsgLeiJGB2u8vrAiWpCU4MxUT6JseWo2SjXy4Qbzn2fwDw',
  },
  {
    payload: '005eadaf9bb7121f0f192561a5a62f5e5f54210292',
    string: '19dcawoKcZdQz365WpXWMhX6QCUpR9SY4r',
  },
  {
    payload: '053f210e7277c899c3a155cc1c90f4106cbddeec6e',
    string: '37Sp6Rv3y4kVd1nQ1JV5pfqXccHNyZm1x3',
  },
  {
    payload: '6fc8a3c2a09a298592c3e180f02487cd91ba3400b5',
    string: 'myoqcgYiehufrsnnkqdqbp69dddVDMopJu',
  },
  {
    payload: 'c499b31df7c9068d1481b596578ddbb4d3bd90baeb',
    string: '2N7FuwuUuoTBrDFdrAZ9KxBmtqMLxce9i1C',
  },
  {
    payload:
      '80c7666842503db6dc6ea061f092cfb9c388448629a6fe868d068c42a488b478ae',
    string: '5KL6zEaMtPRXZKo1bbMq7JDjjo1bJuQcsgL33je3oY8uSJCR5b4',
  },
  {
    payload:
      '8007f0803fc5399e773555ab1e8939907e9badacc17ca129e67a2f5f2ff84351dd01',
    string: 'KwV9KAfwbwt51veZWNscRTeZs9CKpojyu1MsPnaKTF5kz69H1UN2',
  },
  {
    payload:
      'efea577acfb5d1d14d3b7b195c321566f12f87d2b77ea3a53f68df7ebf8604a801',
    string: '93N87D6uxSBzwXvpokpzg8FFmfQPmvX4xHoWQe3pLdYpbiwT5YV',
  },
  {
    payload:
      'ef0b3b34f0958d8a268193a9814da92c3e8b58b4a4378a542863e34ac289cd830c01',
    string: 'cMxXusSihaX58wpJ3tNuuUcZEQGt6DKJ1wEpxys88FFaQCYjku9h',
  },
  {
    payload: '001ed467017f043e91ed4c44b4e8dd674db211c4e6',
    string: '13p1ijLwsnrcuyqcTvJXkq2ASdXqcnEBLE',
  },
  {
    payload: '055ece0cadddc415b1980f001785947120acdb36fc',
    string: '3ALJH9Y951VCGcVZYAdpA3KchoP9McEj1G',
  },
  {
    payload: null,
    string: 'Z9inZq4e2HGQRZQezDjFMmqgUE8NwMRok',
  },
  {
    payload: null,
    string: '3HK7MezAm6qEZQUMPRf8jX7wDv6zig6Ky8',
  },
  {
    payload: null,
    string: '3AW8j12DUk8mgA7kkfZ1BrrzCVFuH1LsXS',
  },
  {
    payload: null,
    string: '#####',
  },
];

describe('#bs58checkdecodeWithoutErr', () => {
  test('適切に変換可能', () => {
    testcase
      .filter((x): x is { string: string; payload: string } => !!x.payload)
      .forEach((cs) => {
        const result = bs58CheckDecodeWithoutErr(cs.string);
        expect(result).not.toBeNull();
        assertNotNull(result);
        expect(byteArray2hex(result)).toEqual(cs.payload);
      });
  });
  test('適切に変換不能なものにnullを返す', () => {
    testcase
      .filter((x): x is { string: string; payload: null } => !x.payload)
      .forEach((cs) => {
        const result = bs58CheckDecodeWithoutErr(cs.string);
        expect(result).toBeNull();
      });
  });
});

describe('#bs58checkencode', () => {
  test('適切に変換可能', () => {
    testcase
      .filter((x): x is { string: string; payload: string } => !!x.payload)
      .forEach((cs) => {
        const result = bs58CheckEncode(hex2bytearray(cs.payload));
        expect(result).toEqual(cs.string);
      });
  });
});
