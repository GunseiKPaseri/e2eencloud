
# remove deno preview features

echo "File Change!"

cat ./prisma-original/schema.prisma \
    | grep -v "previewFeatures" \
    | grep -v "../generated/client" \
    > ./prisma/schema.prisma

yarn prisma generate

yarn run build

exec "$@"
