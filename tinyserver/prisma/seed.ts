import { type Prisma, prisma } from 'tinyserver/src/client/dbclient.ts';

const userData: Prisma.UserCreateInput[] = [
  // user: admin@example.com
  // pass: MyNameIsAdmin.
  {
    id: crypto.randomUUID(),
    email: 'admin@example.com',
    role: 'ADMIN',
    max_capacity: 5242880,
    file_usage: 0,
    client_random_value: '1u0O9EMO2svos371M5oXUg==',
    encrypted_master_key: 'dOBRtpUvYetESsTlYC1d7Q==',
    encrypted_master_key_iv: 'FKVIKy2T+zSQYeR5DD2XXg==',
    encrypted_rsa_private_key:
      'kLX6IqtqHJlvKv/qyQRZA1doSoC5hH+pPuA6x7YBkAeuSb0uo5j3K/XrCvLw/p98/O/WITv/zcNrjJ5mT03E73YS82/1ou35Ski6CuyL1n1WXcTFUWUHdU4nKEjg88VELVMOkK+FUcCU+rKaCMQ5hgOOe35z0XLR3gcNEiMg4kJyBTGWGgjk048J+tK/KDiKWD5Rm+EEBD7KwEIURMVc0utwuaOIQfIP3eL1yj01rapMzaLqaylRkP25CrcJ4PJNmTs0/7y9vGqZWUA4/XEFx0xK1PIcdItlTP473cLg8qGRprQjhmjFkfFj+tyTU/232iveFWuaWE8HDVeAzOREhmnpZeJpuBEClyrCukcpMP1jQvuGrvAK7kNz32XN2dJ57AeagGMhQM3Fdm99EEZpXb+MCEBCRUZobl52Q9OxAMM8Fpim5ghQi2Y7TeNHHAqsf94K/PpjLoWA3z/1ni5fksuNUhuxtjO24Ep0q954a6uLHyZ6HsGd1luDV5awEs+yAusVK2imi7XyJkfyVs9U+A3VdeEWFbU00lb761saRcyeV4UMZ6SqCTDr1duQ0F8rSO8X4rmqeXJ11Q9Ne+qKhaoMTX+C9SNh53thoPCDRpJ2pPxV7Zyn7ZXksFUObafdrW4PZKeq8gd+kGbE3C0ieeTtO8LfeT37ssTP8hyNqNQ+zxqSZfWrQ2zIuq5fOy9U7Bw/4LBaN/yg089wkl5MhD5XFK2Fv0V9UK8lza4pjo25wtCf2RzRS2ByF+6jzUCaB9vULDWCw/uPIow+ZtDU1UygFvqqIUNoPAeDyZLT+lzJxIA9E1Yb+yzOt9JsJuajDdkSv1UhBSJAp0czM4hGvagQwTbKlDiwYK8bQiAGU18qRoWoULLBsg6XWgEm+Sxm1+KcphL5l2XtcpL6VoJ7GSISPlIb1d94aUdb89Bdi9ZgmX5lg9pPPwV7l+EsCC+GufEUcKLUeAOm9/X/8wJBuMbW3zwcOeEzM6MSmcrqpG0ardgyIOBQunrIw44bPDNVbSL7+i28s+jbft376CCvJamdLkj23HYbMozwK+YlQWQooQRxgLGL40mGynzGP6myIDp8TaxMQ0ZwUQotlzamspjbURQ8PyW5iOkM491e9/QnEt3C303x5DWqOrPrunYDymRLSAy04zz3z4BeA2AQHxKECwlbTidAoBAYqDND10MwqxyeQnA2pUi/Xn61dpHF0/cxq5ntA6BqmxWgQv6tMe+vDxgadHJ3IIun32X+pUzJ9UyoX45cgGHPA2ptQ+HMcHh8tFcJlUCv5Kh4gnWbEMO9FjRO7aLC7VeDyJA2XGN+u5ZgqvDIdYmLL18psIzlhwyukcZzBCcArIOWB8WFiXLH0utJZD5GAQIcehy2TXfktdvkzcs9eZPGMOJFTvvckXD2a23BY4hzxCdUP23LKHCzitykuNTxJXipuzTB0oPEa85zSkFb/lkdul7MC2T2xV8s0O8a8A6Zs3IQuhjXlUH+qMVou31IhpkOqPveQaa0HncJ3UkAkIRqb6wdKt35J4PZTcjcqvtqewbhbQEqK5XQbGgDtKlRLfWKSsXg6HhejpRH4hFtsN+hl479LGndpCSpDbhJP9qbO5s/fWpN/qpWGX0VIRXhh27WV4IVamn4mLY5MIf2dwquLBpW4k+7/6yGh0j2LBPp0bk3TekgzqImQEqoHLR4Qdd0W2P8BDpX1Cevm+TM3bCU4o5X3vmO5d/g53AWDtRNysb4ta1Oyj1HbNryzi+pk+1fz2aYSqjOvxT7GdkNU1PsIKLOOaR8xt9ibkdTrlQXUt0QIsoJCtbTsZAApYPHHqZNSluydhEj5KYb568mGDn3+26PgFQ+y01cd1KXBbCVbG2wFmEVp2wMBqSkgENcoCC4BmQ+J8LMnA28yEctQH2J+NZAItxBmGWQwqPiRZ0qYFcC/HoiFNNmTnXEmbg5FtIjc1G9cNu/imGcfJka9FtoqGjnldDETVHHP+z2Y5UygE5xacJuVY1KMGWq4rn3dlEMahQ8A+5zwI9j5i8EWydkt+l/Dz1h1lN6Tn2mYiCVr95XVCWfOgNDXewgv7W3y7YQphw2yCHvsTc2gR1lTLLg2iKAzmZZ6Nin3i+XL+H3DgsCiB51inbbLimcVpDvWjpJl2n3UkftohtvHF6RYshYE7+ERnaz6ta/MqEqFmkwHZo1RpkYbnPlrsgAcWVSSwJpUZFS+GEdqXtvAcL4ql/04wIPq/R+i4yrCmqT3j7BhfwNI6IFSsme2ai93uZLKeDKzbefyCeWyhXp1YJgNGwXOgTdfKDR53f8M2v170u5BDtgdNpZGFmqYy1vdyX7+mcLEvbt8LGbu58tX3seM5fLEM/3fFJbL37HrJNjFEO5E2cKw5HpFlIeE5tn6/IIB+rfmnOsFc9UOR9o/uTxIk3+d1vGecXpnU7Xc6BTLTkbWis1z5GIJAs2Ssf1JfOZGImHpRXTnolY/8G1oW7Z5Ryx9PZ1eEy4rKG8YSqjByX9iQaWbJf9cPVUqAsgnhygPFKCmBaCB3ivU93MxzP5vU/zrC7Gupy4cU9I4378VMhYpoPxGLNcVdg2ELj5OXIilwfeFmxqD1lzvg4MNtCIqHDqL47AhZ0XNWp70BZUnjR45++8zcUUVfhz7qc5WKs1eJ7ScmbJORppBNVK0sMm30pAfxcnVmOxsg1CVcIu1v5r1i0/Duj1vfbbyV1k2s1oe1BDYIgIlkm/fJhlP34+5xs9243FpqzAxnu6uUZTxXG+jIhuoWYL35cXb+grMYQY6nLuPeEVXkod0yUl4ZUO1LVikzalMB1z8db/SyyZwzZFKy7Wuu9vkjdUC+X+m1/hw8BkuNH+SXlQ6q8NXOz4uomAMuoVQLk5GH93LSgJbLFMoZQUOeCTUCza6+/CaS3O6nYH4//bLO0/r12yEBoV2RniI/cW5ErVo5/mO+aGf6bMZKum1Xa4EK95JZrTbc8BjLP/VgeFPskw20e+rEscFGRvar9nZebAZr+3encmj8jRQ6D0RcuuWNANQ7Bo2X57JK0R//VoGGgD5xiYk4B3Eei6nhUbnLWt4TsG/Clvnom4p6TuiOwa119BnhzTH3QYMwEN/xn9bWuCtu5YfphgHzTBxSqKP1LyPy3wavnumqPR8H6VfzHmoPKloSHUaAqB',
    encrypted_rsa_private_key_iv: 'jwTIi4N5xlTzSoljKGpJAw==',
    hashed_authentication_key: 'aFMgA6QDvR6XPrS/NgWtI5QxyG0tfAHtVMErmM7Byh0=',
    rsa_public_key:
      'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAzog3Hbet/IM5lluYa9+t5kJQKUvbRlsp82zx4HVMSyOxJM4dxVwL6DFlafJCEOSIEKeHBIF+q28u7sxlmBv630DnOU2DXBqAyhw1EDyXPCzvQYwNnzdTpwMX+tqnE9WOYVVa6C1OqI2j/GoQog9FWJO38EErll4/XvOxzZ8CI2ranff4ADJJBZFdlDmAqrm91LF1W+Kel7MNQSONSUCdSRj6TacA1Eoy03+q2LjjNaW0emehLmYGVdC7Io6EqMpWZHGq9ujSU+oBFVaGejIPcZpYe/XdDYt97t7n5pPDxVgru4sSKHxf4dNd9is+ztpZmb8dx1HSDT1C0m8pp+mCJWzjbl4pGpkA6IFABJhdnGhuE+E8vmJQ3quYv7U88XiqJ1NpxRNG69vXegJRXKNmDnXsTdGs//Ar+buTqGIoCMqcB9z6jzebe3lPOb5Sg6V8i7nrIC7zm67S5e/kMHR/NcPsuh4x4Vr68KWzS8O4c0q2jfMlPpdWenqGOKUnTWnh5t/b+I3VdQX3Sc7owpQ8GkCDS9sOCvdQUkQ0+8GqNhRPzDwlNJmWkJeVshbinFXZuhcr8N35kheCECKiIUefZ2DhF9kyrXUnqGrkcvplw0z+dm+WEd4K3HNsNtgpu2vNOooy8o0fgYw+205HhhKCBS8s/Nb6roZlOj5RPFoHKoUCAwEAAQ==',
  },
  // user: testuser+ddd@example.com
  // pass: MyNameIsTestUser.
  ...[...Array(10)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `testuser+${i.toString().padStart(3, '0')}@example.com`,
      id: crypto.randomUUID(),
      role: 'USER',
      max_capacity: 5242880,
      file_usage: 0,
      client_random_value: 'dRmeQZSk3cwG74ExRVlvLQ==',
      encrypted_master_key: 'e0e343HmF8lDyv635tgfaQ==',
      encrypted_master_key_iv: 'BRPtnTOHFMVbO58JZR9WeA==',
      encrypted_rsa_private_key:
        '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',
      encrypted_rsa_private_key_iv: 'qR4xFrHl7M0wqlZhBFUpRQ==',
      hashed_authentication_key: 'NJKla3NDuf6e1aoQCj/Y+c4zyLi8zzbn+PyN5koS3nQ=',
      rsa_public_key:
        'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAw1srax4HJp78Gis4isUizKw2PNf+Sfi2+Cy/dAfrUd/WTfR0x+MzlCz9GagJie2pI6Q0OVf5UfMBUX5POIEP+N6O0LEjfVg6dBq68V5MdT3Uirm4/Y7TSwIFJMcGQeGGkEpja+eix1JjtiWzIn91Bz10Gjk1fT5NrOtAuQOzu3bhjfUrEkALcz7w1awvfHxiQKzs6hXlzdpZUgToQU1VUm3YdTDBAmUfPqSle8BFFtirWtoDXz1lg2F26lsCBpF47qLNr6Gq1ALvRFAti14v/SZfNNMCF2+Ws0zIt2WOr1bTioFe5pRCj5Z/nbfTGmF9FSAotfnLH3/llrWtUfkNVXlbAUpq9B6PtGtJn3zMqFwFJqQT92lj7YC34rGlvmr9UKYb4RVS8/XzcTS3GLvBQHlVkBnyz35otqiuT31GIn74G5/edBOE2MWWKemc4plNHkbO8c/1NJXrcEpri5sqj2pVrg4xp2RGveYD3tQMU9qDE9qZWuVOj/gM0rJO1YZZ5coXLOZgzxn0IroG2yk7P9t7epYBcAz1Ob9aIotsYA9fObZnLuAtLvVSBmvP4ZZZFhty7MRRhjv4hKFS33O/wPxTiDCteU0YedSxbNtBUvwaXHU0xV3/4zPhTEyZYUpHgEYnX1VxuN6Ot5fTQPH6+eV2N47L1muZdSBQWJnr9LMCAwEAAQ==',
    }
  )),
  // user: baduser+ddd@example.com
  ...[...Array(2)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `baduser+${i.toString().padStart(3, '0')}@example.com`,
      id: crypto.randomUUID(),
      role: 'USER',
      max_capacity: 10485760,
      file_usage: 0,
      client_random_value: '',
      encrypted_master_key: '',
      encrypted_master_key_iv: '',
      encrypted_rsa_private_key: '',
      encrypted_rsa_private_key_iv: '',
      hashed_authentication_key: '',
      rsa_public_key: '',
    }
  )),
];

try {
  console.log('◭Delete...');

  await prisma.user.deleteMany({});

  console.log('◭seeding...');

  console.log('- Users');
  await prisma.user.createMany({
    data: userData,
  });

  console.log('◭Seeding finished!');
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
